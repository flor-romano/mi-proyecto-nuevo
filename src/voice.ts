import locucion from './locucion.json';

// Tiempos de la locución (generados con scripts/alinear-locucion.py).
export type SceneKey = keyof typeof locucion;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zñ0-9]/g, '');

export const voice = (key: SceneKey) => {
  const { duration, words } = locucion[key];
  return {
    duration,
    // Segundo (desde el inicio del audio) en que empieza la n-ésima aparición de la palabra.
    w(word: string, n = 1): number {
      const target = normalize(word);
      const hits = words.filter((x) => normalize(x.w) === target);
      if (hits.length < n) throw new Error(`"${word}" (${n}) no aparece en la locución de ${key}`);
      return hits[n - 1].s;
    },
    // Primera aparición de la palabra después del segundo `t`.
    after(word: string, t: number): number {
      const target = normalize(word);
      const hit = words.find((x) => x.s > t && normalize(x.w) === target);
      if (!hit) throw new Error(`"${word}" no aparece después de ${t} s en la locución de ${key}`);
      return hit.s;
    },
    words,
  };
};
