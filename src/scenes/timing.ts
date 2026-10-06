import { createContext, useContext } from 'react';
import { sec } from '../theme';

// Duración de cada transición de deslizamiento (en frames).
export const TRANSITION = 20;
// Las escenas 2 en adelante arrancan media transición antes de su lugar en la línea de tiempo,
// así el centro del deslizamiento cae justo en el corte.
export const HALF = TRANSITION / 2;

// Margen antes y después de la locución de cada escena.
export const LEAD_IN = 0.5;
export const TAIL = 0.8;

// Frame local (dentro de la secuencia de la escena) en que empieza su locución.
export const VoiceStart = createContext(0);

// Convierte segundos desde el inicio de la locución de la escena en frames locales.
export const useAt = () => {
  const voiceFrame = useContext(VoiceStart);
  return (seconds: number) => voiceFrame + sec(seconds);
};
