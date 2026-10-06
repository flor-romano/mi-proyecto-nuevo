"""Genera los efectos de sonido del video (sin samples externos) en public/sfx:
- whoosh.wav: ruido filtrado con un barrido de frecuencia, para las transiciones.
- pop-1.wav … pop-3.wav: "pop" corto con caída de tono, en tres alturas.

El nivel de cada efecto se ajusta a -20 dB respecto del nivel promedio de la locución
(RMS de los tramos con voz de public/audio/escena-*.mp3), así se pueden usar en el video
a volumen 1 sin tapar la voz.

Uso: python3 scripts/generar-sonidos.py   (requiere numpy y ffmpeg)
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
RELATIVE_DB = -20.0
rng = np.random.default_rng(7)

def voice_rms_db():
    chunks = []
    for path in sorted((ROOT / 'public/audio').glob('escena-*.mp3')):
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                             check=True, capture_output=True).stdout
        chunks.append(np.frombuffer(raw, dtype=np.float32))
    x = np.concatenate(chunks)
    n = SR // 100
    frames = x[: len(x) // n * n].reshape(-1, n)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    active = frames[db > np.percentile(db, 80) - 25]
    return 20 * np.log10(np.sqrt((active ** 2).mean()))

def active_rms_db(y):
    n = SR // 100
    frames = y[: len(y) // n * n].reshape(-1, n)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    active = frames[db > db.max() - 20]
    return 20 * np.log10(np.sqrt((active ** 2).mean()))

def bandpass_sweep(x, f_start, f_peak, f_end, q=1.2):
    """Filtro pasa banda (biquad) cuya frecuencia central sube y vuelve a bajar."""
    t = np.linspace(0, 1, len(x))
    f = np.where(t < 0.5, f_start * (f_peak / f_start) ** (t / 0.5), f_peak * (f_end / f_peak) ** ((t - 0.5) / 0.5))
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    block = 64
    for i in range(0, len(x), block):
        w0 = 2 * np.pi * f[i] / SR
        alpha = np.sin(w0) / (2 * q)
        b0, b2 = alpha, -alpha
        a0, a1, a2 = 1 + alpha, -2 * np.cos(w0), 1 - alpha
        for j in range(i, min(i + block, len(x))):
            out = (b0 * x[j] + b2 * x2 - a1 * y1 - a2 * y2) / a0
            x2, x1 = x1, x[j]
            y2, y1 = y1, out
            y[j] = out
    return y

def whoosh(duration=0.6):
    n = int(SR * duration)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    y = bandpass_sweep(noise, 350, 2200, 700)
    env = np.sin(np.pi * t) ** 1.6 * (1 - 0.3 * t)
    return y * env

def pop(freq, duration=0.09):
    n = int(SR * duration)
    t = np.arange(n) / SR
    f = freq * (0.45 + 0.55 * np.exp(-t * 60))  # caída rápida de tono
    phase = 2 * np.pi * np.cumsum(f) / SR
    env = (1 - np.exp(-t * 900)) * np.exp(-t * 45)
    return np.sin(phase) * env

def fade_out(y, ms=8):
    k = int(SR * ms / 1000)
    y[-k:] *= np.linspace(1, 0, k)
    return y

def save(name, y, target_db):
    y = fade_out(y.astype(np.float64))
    y *= 10 ** ((target_db - active_rms_db(y)) / 20)
    peak = np.abs(y).max()
    if peak > 0.9:
        y *= 0.9 / peak
    out = ROOT / 'public/sfx' / name
    out.parent.mkdir(exist_ok=True)
    with wave.open(str(out), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(f'{name}: {active_rms_db(y):.1f} dBFS RMS, pico {20 * np.log10(np.abs(y).max()):.1f} dBFS')

voice = voice_rms_db()
target = voice + RELATIVE_DB
print(f'Locución: {voice:.1f} dBFS RMS → efectos a {target:.1f} dBFS RMS')
save('whoosh.wav', whoosh(), target)
for i, freq in enumerate([620, 760, 900], start=1):
    save(f'pop-{i}.wav', pop(freq), target)
