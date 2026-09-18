# mi-proyecto-nuevo

Repositorio de trabajo del curso SCORM **"Surtido sin venta"**
(Área Aprendizaje · COTO, categoría Salón).

- **`surtido-sin-venta/`** — el curso. Su bitácora, las decisiones de
  armado y el relay de hallazgos hacia el kit están en
  [`surtido-sin-venta/README-CURSO.md`](surtido-sin-venta/README-CURSO.md).
- **`kit-base/`** — el kit v1.9.80 **tal como se recibió, sin editar**.
  Está acá solo como referencia: `kit-base/` se edita en un único lugar,
  su propio chat, nunca desde la sesión de un curso
  (`kit-base/CLAUDE.md` §0.1). El árbol es idéntico al zip de origen.

## Cómo correr las verificaciones

```bash
cd kit-base && npm install && cd ../surtido-sin-venta
ln -sfn ../kit-base/node_modules node_modules
python3 -m http.server 8080 &
COURSE_URL="http://localhost:8080/index.html" npm test
```
