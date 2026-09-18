#!/usr/bin/env python3
"""pdf-capa-texto.py — kit-base v1.9.78

Le pone CAPA DE TEXTO a un PDF hecho de imágenes, sin tocar la imagen.

POR QUÉ. Los PDF descargables de estos cursos se arman rindiendo las
páginas del diseñador: son imágenes, así que no se pueden buscar, ni
copiar, ni leer con un lector de pantalla. Un documento que el alumno
baja "para consultar" y en el que no puede buscar una palabra sirve la
mitad.

QUÉ HACE. Rinde cada página a 300 DPI, saca las cajas de palabra con
tesseract y las escribe con `render_mode=3` — texto INVISIBLE, encima
de la imagen y calzado con ella. La imagen no se toca.

Y EL PESO NO SE MUEVE si se limpia con `clean_contents()` + `garbage=4`
al guardar: sin eso el texto invisible suma un par de cientos de KB por
las fuentes embebidas.

REQUISITOS (los dos fuera del kit, a propósito: son pesados y esto se
corre una vez por documento, no en cada build):
    pip install pymupdf pytesseract pillow
    apt install tesseract-ocr tesseract-ocr-spa

Uso:
    python3 tools/pdf-capa-texto.py entrada.pdf [salida.pdf] [--dpi 300] [--idioma spa]
"""
import sys
import os

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ops = sys.argv[1:]
    if not args:
        print(__doc__)
        return 1
    entrada = args[0]
    salida = args[1] if len(args) > 1 else entrada.replace('.pdf', '-texto.pdf')
    dpi = 300
    idioma = 'spa'
    for i, a in enumerate(ops):
        if a == '--dpi' and i + 1 < len(ops):
            dpi = int(ops[i + 1])
        if a == '--idioma' and i + 1 < len(ops):
            idioma = ops[i + 1]

    try:
        import fitz                      # pymupdf
        import pytesseract
        from PIL import Image
    except ImportError as e:
        print(f"✗ falta una dependencia: {e}")
        print("  pip install pymupdf pytesseract pillow")
        print("  apt install tesseract-ocr tesseract-ocr-spa")
        return 1

    if not os.path.exists(entrada):
        print(f"✗ no existe: {entrada}")
        return 1

    doc = fitz.open(entrada)
    palabras_total = 0

    for n, pagina in enumerate(doc):
        # Render a `dpi`: la escala es dpi/72 porque PDF trabaja en puntos.
        escala = dpi / 72.0
        pix = pagina.get_pixmap(matrix=fitz.Matrix(escala, escala))
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)

        datos = pytesseract.image_to_data(img, lang=idioma,
                                          output_type=pytesseract.Output.DICT)
        for i, txt in enumerate(datos['text']):
            txt = (txt or '').strip()
            if not txt:
                continue
            try:
                conf = float(datos['conf'][i])
            except (TypeError, ValueError):
                conf = -1
            if conf < 60:               # por debajo de eso tesseract adivina
                continue
            # De píxeles del render a puntos del PDF.
            x = datos['left'][i] / escala
            y = datos['top'][i] / escala
            h = datos['height'][i] / escala
            # `render_mode=3` = invisible. El texto queda seleccionable y
            # buscable, y encima de la imagen, que no se toca.
            pagina.insert_text((x, y + h * 0.82), txt,
                               fontsize=max(1, h * 0.82),
                               render_mode=3, color=(0, 0, 0))
            palabras_total += 1
        print(f"  página {n + 1}/{len(doc)} — {palabras_total} palabra(s) acumuladas")

    antes = os.path.getsize(entrada) / 1024
    # `clean_contents` + `garbage=4` + `deflate`: sin esto el texto
    # invisible suma un par de cientos de KB por las fuentes embebidas.
    for pagina in doc:
        pagina.clean_contents()
    doc.save(salida, garbage=4, deflate=True, clean=True)
    doc.close()
    despues = os.path.getsize(salida) / 1024

    print(f"\n✓ {salida}")
    print(f"  {palabras_total} palabras de capa invisible")
    print(f"  peso: {antes:.0f} KB → {despues:.0f} KB ({despues - antes:+.0f} KB)")
    return 0


if __name__ == '__main__':
    sys.exit(main())
