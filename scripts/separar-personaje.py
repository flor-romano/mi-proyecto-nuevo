"""Separa la ilustración original del personaje en dos partes:
- el personaje solo (mismo lienzo y tamaño que el original, sin deformar),
- cada burbuja de diálogo por separado, recoloreada a #78D2F0, para animarlas de a una.

Uso: python3 scripts/separar-personaje.py
Requiere: pip install pillow numpy scipy
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/ilustraciones/personaje-pensativo-original.png'
OUT = ROOT / 'public/ilustraciones'
BUBBLE_RGB = np.array([160, 214, 225], dtype=float)  # color original de las burbujas
TARGET_RGB = np.array([0x78, 0xD2, 0xF0], dtype=float)

im = np.array(Image.open(SRC).convert('RGBA'))
labels, n = ndimage.label(im[..., 3] > 0)
sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1))
person = int(np.argmax(sizes)) + 1

# Personaje solo, en el lienzo original.
only_person = im.copy()
only_person[labels != person] = 0
Image.fromarray(only_person).save(OUT / 'personaje-pensativo.png')

(OUT / 'burbujas').mkdir(exist_ok=True)
bubbles = []
for idx, sl in enumerate(ndimage.find_objects(labels), start=1):
    if idx == person or sizes[idx - 1] < 200:
        continue
    crop = im[sl].copy()
    mask = labels[sl] == idx
    crop[~mask] = 0
    rgb = crop[..., :3].astype(float)
    # 0 = color de burbuja, 1 = blanco (signos); se conserva el antialias.
    t = np.clip((rgb[..., 0] - BUBBLE_RGB[0]) / (255 - BUBBLE_RGB[0]), 0, 1)[..., None]
    crop[..., :3] = (TARGET_RGB * (1 - t) + 255 * t).round().astype(np.uint8)
    name = f'burbuja-{len(bubbles) + 1}.png'
    Image.fromarray(crop).save(OUT / 'burbujas' / name)
    ys, xs = sl
    bubbles.append({'file': name, 'x': xs.start, 'y': ys.start, 'w': xs.stop - xs.start, 'h': ys.stop - ys.start})

meta = {'width': im.shape[1], 'height': im.shape[0], 'bubbles': bubbles}
(OUT / 'burbujas/burbujas.json').write_text(json.dumps(meta, indent=2))
print(json.dumps(meta, indent=2))
