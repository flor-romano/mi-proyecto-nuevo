import { Easing, useCurrentFrame, useVideoConfig } from "remotion";

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.inOut(Easing.cubic);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Tiempo actual en segundos (más fácil de leer que frames).
export const useSegundos = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, frame, fps };
};

// Mezcla dos colores hex (#RRGGBB) según k ∈ [0, 1].
export const mezclar = (a: string, b: string, k: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return `rgb(${c.join(",")})`;
};
