"""Estima en qué momento se dice cada palabra de la locución.

No usa reconocimiento de voz: reparte las palabras del guion (scripts/locucion.txt)
según su cantidad de sílabas y las ajusta a las pausas y caídas de energía de cada
audio de public/audio. Las pausas largas fijan el final de cada frase; dentro de la
frase, cada palabra se acerca a la caída de energía más cercana.

Salida: src/locucion.json con la duración de cada audio y el inicio de cada palabra.
Uso: python3 scripts/alinear-locucion.py   (requiere numpy y ffmpeg)
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 16000
HOP = 0.01  # 10 ms

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

def envelope_db(x):
    n = int(SR * HOP)
    frames = len(x) // n
    rms = np.sqrt(np.mean(x[: frames * n].reshape(frames, n) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    return np.convolve(db, np.ones(3) / 3, mode='same')

def syllables(word):
    w = word.lower()
    w = re.sub(r'[^a-záéíóúüñ]', '', w)
    # Grupos vocálicos; las vocales fuertes juntas (a, e, o) forman hiato.
    groups = re.findall(r'[aeiouáéíóúü]+', w)
    count = 0
    for g in groups:
        strong = sum(c in 'aeoáéíóú' for c in g)
        count += max(1, strong)
    return max(1, count)

def runs(mask):
    """Devuelve (inicio, fin) en frames de cada tramo True."""
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((start, i)); start = None
    if start is not None:
        out.append((start, len(mask)))
    return out

def parse_text():
    scenes, cur = {}, None
    for line in (ROOT / 'scripts/locucion.txt').read_text().splitlines():
        if line.startswith('#') or not line.strip():
            continue
        m = re.match(r'\[(\d+)\]', line)
        if m:
            cur = int(m.group(1)); scenes[cur] = ''
        else:
            scenes[cur] += ' ' + line.strip()
    return scenes

def align(text, x):
    db = envelope_db(x)
    speech_level = np.percentile(db, 80)
    voiced = db > speech_level - 30
    idx = np.where(voiced)[0]
    t0, t1 = idx[0] * HOP, (idx[-1] + 1) * HOP

    words = text.split()
    # Pausa esperada después de la palabra: fuerte en punto/dos puntos, media en coma.
    pause_after = [2 if re.search(r'[.:?!]$', w) else 1 if w.endswith(',') else 0 for w in words]
    syl = np.array([syllables(w) for w in words], dtype=float)

    # Pausas reales: tramos sin voz de al menos 90 ms dentro del habla.
    gaps = [(a * HOP, b * HOP) for a, b in runs(~voiced) if (b - a) * HOP >= 0.09 and a * HOP > t0 and b * HOP < t1]

    # Asignar pausas reales a los cortes de puntuación, en orden, por cercanía a la estimación lineal.
    def linear_starts(seg_words, s, e):
        w = syl[seg_words]
        edges = np.concatenate([[0], np.cumsum(w)]) / w.sum()
        return s + edges[:-1] * (e - s), s + edges[1:] * (e - s)

    breaks = [i for i, p in enumerate(pause_after[:-1]) if p > 0]
    est_start, est_end = linear_starts(np.arange(len(words)), t0, t1)
    anchors = {}  # índice de palabra -> (fin de esa palabra, inicio de la siguiente)
    used = set()
    for i in sorted(breaks, key=lambda i: -pause_after[i]):
        t = est_end[i]
        best = None
        for gi, (a, b) in enumerate(gaps):
            if gi in used:
                continue
            d = abs((a + b) / 2 - t)
            limit = 1.2 if pause_after[i] == 2 else 0.6
            if d < limit and (best is None or d < best[0]):
                best = (d, gi)
        if best:
            gi = best[1]
            # Respetar el orden: no cruzar anclas ya asignadas.
            a, b = gaps[gi]
            ok = all((j < i) == (gaps[g][0] < a) for j, g in anchors.items())
            if ok:
                anchors[i] = gi; used.add(gi)

    starts = np.zeros(len(words))
    seg_start, first = t0, 0
    for i in sorted(anchors) + [len(words) - 1]:
        a, b = gaps[anchors[i]] if i in anchors else (t1, t1)
        seg = np.arange(first, i + 1)
        s, _ = linear_starts(seg, seg_start, a)
        starts[seg] = s
        seg_start, first = b, i + 1

    # Acercar cada inicio de palabra a la caída de energía más cercana (±150 ms).
    dips = [((a + b) / 2) for a, b in runs(db < speech_level - 14)]
    for k in range(1, len(words)):
        cands = [d for d in dips if abs(d - starts[k]) <= 0.15 and starts[k - 1] + 0.08 < d]
        if cands:
            starts[k] = min(cands, key=lambda d: abs(d - starts[k]))
    return words, starts, t0, t1, len(anchors), len(breaks)

def main():
    out = {}
    for n, text in parse_text().items():
        path = ROOT / f'public/audio/escena-{n}.mp3'
        x = load(path)
        words, starts, t0, t1, matched, expected = align(text.strip(), x)
        rate = sum(syllables(w) for w in words) / (t1 - t0)
        print(f'escena-{n}: {len(x)/SR:6.2f} s, habla {t0:.2f}–{t1:.2f}, {rate:.1f} síl/s, pausas ancladas {matched}/{expected}')
        out[f'escena-{n}'] = {
            'duration': round(len(x) / SR, 3),
            'words': [{'w': w, 's': round(float(s), 2)} for w, s in zip(words, starts)],
        }
    (ROOT / 'src/locucion.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))

main()
