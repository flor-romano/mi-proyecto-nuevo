import { sec } from '../theme';

// Duración de cada transición de deslizamiento (en frames).
export const TRANSITION = 20;
// Las escenas 2 en adelante arrancan media transición antes de su minuto del guion,
// así el centro del deslizamiento cae justo en el tiempo indicado.
export const HALF = TRANSITION / 2;

// Tiempo dentro de una escena medido desde su inicio en el guion.
export const at = (seconds: number) => HALF + sec(seconds);
