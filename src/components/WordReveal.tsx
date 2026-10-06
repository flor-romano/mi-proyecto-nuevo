import { interpolate, useCurrentFrame } from 'remotion';

type Props = {
  // Las palabras entre **dobles asteriscos** se muestran en negrita.
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  boldStyle?: React.CSSProperties;
};

// Texto que aparece palabra por palabra con un fundido y un leve desplazamiento.
export const WordReveal: React.FC<Props> = ({ text, delay = 0, stagger = 3, style, boldStyle }) => {
  const frame = useCurrentFrame();
  const tokens: { word: string; bold: boolean }[] = [];
  text.split(/(\*\*[^*]+\*\*)/).forEach((chunk) => {
    const bold = chunk.startsWith('**');
    const clean = bold ? chunk.slice(2, -2) : chunk;
    clean
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => tokens.push({ word, bold }));
  });

  return (
    <div style={style}>
      {tokens.map(({ word, bold }, i) => {
        const local = frame - delay - i * stagger;
        const p = interpolate(local, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const eased = 1 - Math.pow(1 - p, 3);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: eased,
              transform: `translateY(${(1 - eased) * 18}px)`,
              filter: `blur(${(1 - eased) * 4}px)`,
              ...(bold ? { fontWeight: 700, ...boldStyle } : null),
            }}
          >
            {word}
            {i < tokens.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};
