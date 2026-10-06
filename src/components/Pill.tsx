import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, type } from '../theme';

type Props = {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
};

// Título en pastilla celeste con texto blanco (Faible Black 50 / 50).
export const Pill: React.FC<Props> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  const textIn = interpolate(frame - delay, [6, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        display: 'inline-block',
        backgroundColor: colors.pill,
        color: colors.white,
        ...type.pill,
        padding: '16px 30px',
        borderRadius: 50,
        transform: `scale(${0.6 + 0.4 * s})`,
        transformOrigin: 'left center',
        opacity: Math.min(1, s * 1.5),
        boxShadow: '0 10px 24px rgba(0, 150, 210, 0.18)',
        ...style,
      }}
    >
      <span style={{ opacity: textIn, display: 'inline-block', transform: `translateY(${(1 - textIn) * 8}px)` }}>
        {children}
      </span>
    </div>
  );
};
