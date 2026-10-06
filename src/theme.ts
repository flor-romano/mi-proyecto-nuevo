import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { loadFont as loadRoboto } from '@remotion/google-fonts/Roboto';
import { loadFont as loadLocalFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import localFonts from '../public/fonts/manifest.json';

// Por defecto las fuentes se cargan de Google Fonts con @remotion/google-fonts.
// Con REMOTION_LOCAL_FONTS=1 se usan las copias de public/fonts (para renders
// detrás de un proxy que no deja al navegador llegar a fonts.gstatic.com).
const useLocal = process.env.REMOTION_LOCAL_FONTS === '1';

if (useLocal) {
  localFonts.forEach(({ family, weight, file, unicodeRange }) =>
    loadLocalFont({ family, url: staticFile(`fonts/${file}`), weight, unicodeRange }),
  );
} else {
  loadNunito('normal', { weights: ['900'], subsets: ['latin', 'latin-ext'] });
  loadRoboto('normal', { weights: ['400', '700'], subsets: ['latin', 'latin-ext'] });
}

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

export const fonts = {
  title: "'Nunito', sans-serif",
  body: "'Roboto', sans-serif",
};

export const colors = {
  white: '#FFFFFF',
  sky: '#96DCF0',
  pill: '#78D2F0',
  accent: '#0096D2',
  accentDeep: '#006EEA',
  text: '#1F2A33',
  textSoft: '#4A5A66',
  success: '#2E9E5B',
};
