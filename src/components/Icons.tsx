import { colors } from '../theme';

// Íconos lineales blancos para usar sobre círculos celestes.
type IconProps = { size?: number; color?: string };

export const SpoiledMeatIcon: React.FC<IconProps> = ({ size = 80, color = colors.white }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 58 C14 36 34 18 58 20 C80 22 92 40 86 60 C80 80 56 86 38 80 C28 76 22 68 20 58 Z" />
    <path d="M36 50 C44 40 58 40 64 50 C68 58 60 66 50 64" />
    <circle cx={70} cy={66} r={6} />
    <path d="M30 14 C30 8 34 6 34 2 M46 12 C46 6 50 4 50 0" opacity={0.85} />
  </svg>
);

export const MicrobeIcon: React.FC<IconProps> = ({ size = 80, color = colors.white }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round">
    <rect x={30} y={14} width={34} height={60} rx={17} transform="rotate(35 47 44)" />
    <rect x={14} y={58} width={30} height={22} rx={11} transform="rotate(-20 29 69)" />
    <circle cx={44} cy={36} r={3} fill={color} />
    <circle cx={54} cy={48} r={3} fill={color} />
    <circle cx={40} cy={52} r={3} fill={color} />
    <circle cx={26} cy={70} r={2.5} fill={color} />
    <circle cx={34} cy={66} r={2.5} fill={color} />
    <circle cx={74} cy={74} r={9} />
    <circle cx={74} cy={74} r={2.5} fill={color} />
  </svg>
);
