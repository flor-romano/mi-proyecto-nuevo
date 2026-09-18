#!/usr/bin/env python3
"""build-zip.py — arma el zip de entrega de un curso (o de kit-base
mismo) con nombres de archivo UTF-8 forzados.

Por qué existe: sin forzar el flag, `zip`/`zipfile` en un locale no-UTF-8
puede guardar mal cualquier nombre con tildes/ñ (ej. "Cómo" → "C#U00f3mo")
— se ve roto en Windows/7-Zip aunque acá parezca normal (CLAUDE.md §3.9).
Se reconstruyó a mano varias veces antes de subirlo acá; ahora es una
herramienta fija del kit, no un script ad-hoc por sesión.

⚠️ Trampa de `zipfile` (la razón de que esto no sea un one-liner):
poner `flag_bits` en el `ZipInfo` ANTES de `writestr()` NO sirve —
`_open_to_write()` lo pisa con `0x00` internamente. Hay que volver a
ponerlo recorriendo `z.filelist` DESPUÉS de escribir todo y ANTES de
`z.close()` (que es cuando se escribe el directorio central, el que
leen los descompresores). Este script ya lo hace bien y además VERIFICA
el resultado reabriendo el zip — no hay que confiar en "se ve bien".

Uso:
    python3 build-zip.py <carpeta_origen> <salida.zip> [nombre_a_excluir ...]

Ejemplos:
    python3 build-zip.py kit-base kit-base-v1.9.40.zip
    python3 build-zip.py seguridad-alimentaria seguridad-alimentaria.zip node_modules

Excluye siempre, sin necesidad de pedirlo: node_modules/, .git/,
__pycache__/, .pytest_cache/, .DS_Store, Thumbs.db, y cualquier
README.md que conviva con un README-CURSO.md en la misma carpeta (regla
de §6.43 — nunca empaquetar los dos READMEs con nombres casi iguales).
"""
import os
import sys
import zipfile

EXCLUIR_DIRS = {'node_modules', '.git', '__pycache__', '.pytest_cache'}
EXCLUIR_ARCH = {'.DS_Store', 'Thumbs.db'}
ARCHIVOS_DE_TRABAJO = {'PROMPT-CURSO-NUEVO.md', 'header-boilerplate.html'}


def juntar(raiz, excluir_nombres=()):
    """Devuelve [(ruta_absoluta, nombre_en_zip)] ordenado, determinístico."""
    items = []
    raiz = os.path.abspath(raiz)
    tiene_readme_curso = os.path.isfile(os.path.join(raiz, 'README-CURSO.md'))
    for dirpath, dirnames, filenames in os.walk(raiz):
        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUIR_DIRS)
        for f in sorted(filenames):
            if f in EXCLUIR_ARCH:
                continue
            abs_p = os.path.join(dirpath, f)
            rel = os.path.relpath(abs_p, raiz)
            partes = rel.replace(os.sep, '/').split('/')
            if partes[0] in excluir_nombres or rel.replace(os.sep, '/') in excluir_nombres:
                continue
            # §6.43: si hay README-CURSO.md en la raíz, el README.md de
            # la raíz (heredado del scaffold del kit) NUNCA se empaqueta.
            if tiene_readme_curso and len(partes) == 1 and partes[0] == 'README.md':
                continue
            # Archivos de TRABAJO del kit que el scaffold deja en la
            # carpeta a propósito, pero que no son parte del curso
            # entregable (kit-base v1.9.72, §7.18 K8):
            #   · PROMPT-CURSO-NUEVO.md — documentación de proceso; sirve
            #     para retomar la carpeta en un chat nuevo, no al alumno.
            #   · header-boilerplate.html — el header YA está inyectado
            #     dentro del index.html. Mandar los dos es garantizar que
            #     algún día se desincronicen, que es justo lo que advierte
            #     el comentario del propio generador.
            # El zip del curso de referencia aprobado no lleva ninguno.
            if len(partes) == 1 and partes[0] in ARCHIVOS_DE_TRABAJO:
                continue
            items.append((abs_p, rel.replace(os.sep, '/')))
    return items


def construir(raiz, salida, excluir_nombres=()):
    items = juntar(raiz, excluir_nombres)
    if not items:
        raise SystemExit('Nada para empaquetar en %r (¿ruta correcta?)' % raiz)
    with zipfile.ZipFile(salida, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for abs_p, nombre in items:
            with open(abs_p, 'rb') as fh:
                z.writestr(nombre, fh.read())
        # El paso que importa: re-aplicar el flag UTF-8 al directorio
        # central DESPUÉS de escribir todas las entradas.
        for zi in z.filelist:
            zi.flag_bits |= 0x800

    # Verificación real, no "se ve bien": reabrir y chequear entrada por
    # entrada, más un testzip() de integridad.
    with zipfile.ZipFile(salida) as z:
        sin_flag = [zi.filename for zi in z.filelist if not (zi.flag_bits & 0x800)]
        assert not sin_flag, 'entradas sin flag UTF-8: %r' % sin_flag[:5]
        roto = z.testzip()
        assert roto is None, 'entrada corrupta: %s' % roto
        n = len(z.filelist)
    return n, os.path.getsize(salida)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(1)
    raiz, salida = sys.argv[1], sys.argv[2]
    excluir = set(sys.argv[3:])
    n, size = construir(raiz, salida, excluir)
    print('%s  —  %d entradas, %.2f MB, flag UTF-8 verificado en las %d'
          % (salida, n, size / 1024 / 1024, n))


if __name__ == '__main__':
    main()
