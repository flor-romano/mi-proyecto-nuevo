// Descarga a public/fonts los archivos de Google Fonts que usa el video.
// Solo hace falta cuando el navegador del render no puede acceder a fonts.gstatic.com
// (por ejemplo, detrás de un proxy corporativo). Ver README.
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const FONTS = [
  { mod: '@remotion/google-fonts/Nunito', name: 'Nunito', weights: ['900'] },
  { mod: '@remotion/google-fonts/Roboto', name: 'Roboto', weights: ['400', '700'] },
];
const SUBSETS = ['latin', 'latin-ext'];

const manifest = [];
for (const { mod, name, weights } of FONTS) {
  const info = require(mod).getInfo();
  for (const weight of weights) {
    for (const subset of SUBSETS) {
      const url = info.fonts.normal[weight][subset];
      const file = `${name}-${weight}-${subset}.woff2`;
      execFileSync('curl', ['-sSfL', '-o', `public/fonts/${file}`, url]);
      manifest.push({ family: name, weight, subset, file, unicodeRange: info.unicodeRanges[subset] });
      console.log('✓', file);
    }
  }
}
writeFileSync('public/fonts/manifest.json', JSON.stringify(manifest, null, 2));
