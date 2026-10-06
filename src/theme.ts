import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Tipografías del proyecto, desde los archivos de public/fonts/propias.
loadFont({ family: 'Faible Black', url: staticFile('fonts/propias/Faible-Black.ttf'), weight: '900' });
loadFont({ family: 'Roboto', url: staticFile('fonts/propias/Roboto-Regular.ttf'), weight: '400' });
loadFont({ family: 'Roboto', url: staticFile('fonts/propias/Roboto-Bold.ttf'), weight: '700' });

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

export const fonts = {
  title: "'Faible Black', sans-serif",
  body: "'Roboto', sans-serif",
};

// Escala tipográfica (pt del diseño = px en 1920×1080).
export const type = {
  // Título de portada: Faible Black 80 / 80.
  cover: { fontFamily: fonts.title, fontWeight: 900, fontSize: 80, lineHeight: '80px' },
  // Título sin contenedor: Faible Black 70 / 70.
  title: { fontFamily: fonts.title, fontWeight: 900, fontSize: 70, lineHeight: '70px' },
  // Título en pastilla: Faible Black 50 / 50.
  pill: { fontFamily: fonts.title, fontWeight: 900, fontSize: 50, lineHeight: '50px' },
  // Subtítulos: Roboto Bold 40 / 45.
  subtitle: { fontFamily: fonts.body, fontWeight: 700, fontSize: 40, lineHeight: '45px' },
  // Textos: Roboto Regular 30 / 35.
  body: { fontFamily: fonts.body, fontWeight: 400, fontSize: 30, lineHeight: '35px' },
} satisfies Record<string, React.CSSProperties>;

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
