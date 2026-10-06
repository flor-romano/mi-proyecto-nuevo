import { colors } from '../theme';

// Círculo azul con un check blanco.
export const CheckBadge: React.FC<{ size?: number; color?: string }> = ({ size = 52, color = colors.accentDeep }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 30 30">
      <path d="M7 15 L13 21 L23 9" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
