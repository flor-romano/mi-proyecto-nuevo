import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../theme';

type Props = {
  size: number;
  delay: number;
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
};

// Círculo celeste con un ícono adentro; entra con escala y rebote suave.
export const IconCircle: React.FC<Props> = ({ size, delay, children, color = colors.pill, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 130 } });
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
        boxShadow: '0 10px 24px rgba(0, 150, 210, 0.18)',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
