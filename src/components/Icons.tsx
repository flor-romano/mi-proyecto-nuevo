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

const LineIcon: React.FC<IconProps & { children: React.ReactNode; strokeWidth?: number }> = ({
  size = 80,
  color = colors.white,
  strokeWidth = 5,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ overflow: 'visible' }}
  >
    {children}
  </svg>
);

// Olor: nariz de perfil con líneas de aroma.
export const SmellIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M38 14 C38 36 24 50 24 62 C24 70 32 74 42 70" />
    <path d="M42 70 C40 78 44 84 52 82" />
    <path d="M62 30 C56 36 68 42 62 48 C56 54 68 60 62 66" />
    <path d="M78 24 C72 30 84 36 78 42 C72 48 84 54 78 60" />
  </LineIcon>
);

// Textura: huella dactilar.
export const TextureIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p} strokeWidth={4.5}>
    <path d="M26 40 C30 24 44 16 58 18 C74 22 82 36 80 52" />
    <path d="M34 72 C30 64 28 54 32 44 C36 34 46 28 56 30 C66 32 72 42 70 54 C69 62 70 70 74 76" />
    <path d="M44 82 C40 72 38 62 42 52 C44 44 52 40 58 44 C62 48 60 56 60 62 C60 70 62 78 66 84" />
    <path d="M52 86 C48 76 48 64 50 54" />
  </LineIcon>
);

// Color: paleta de pintor.
export const ColorIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M50 14 C26 14 12 32 12 50 C12 70 28 86 48 86 C58 86 58 78 54 72 C50 66 54 60 62 60 L72 60 C82 60 88 52 88 44 C88 26 70 14 50 14 Z" />
    <circle cx={32} cy={46} r={5} fill={p.color ?? colors.white} />
    <circle cx={46} cy={30} r={5} fill={p.color ?? colors.white} />
    <circle cx={66} cy={32} r={5} fill={p.color ?? colors.white} />
  </LineIcon>
);

// Sabor: boca con lengua.
export const TasteIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M14 42 C30 34 70 34 86 42 C80 64 66 76 50 76 C34 76 20 64 14 42 Z" />
    <path d="M14 42 C32 50 68 50 86 42" />
    <path d="M38 52 C38 64 44 70 50 70 C56 70 62 64 62 52" />
    <path d="M50 54 L50 64" />
  </LineIcon>
);

// Ojo ("a simple vista").
export const EyeIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M8 50 C22 28 36 20 50 20 C64 20 78 28 92 50 C78 72 64 80 50 80 C36 80 22 72 8 50 Z" />
    <circle cx={50} cy={50} r={14} />
    <circle cx={50} cy={50} r={5} fill={p.color ?? colors.white} />
  </LineIcon>
);

// Mala conservación: heladera con la puerta abierta.
export const FridgeIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <rect x={22} y={10} width={40} height={80} rx={6} />
    <path d="M22 38 L62 38" />
    <path d="M62 14 L84 22 L84 86 L62 88" />
    <path d="M70 28 L70 34 M70 50 L70 62" />
    <path d="M30 22 L30 28 M30 48 L30 58" />
  </LineIcon>
);

// Peligro físico: muffin con un elemento extraño clavado (inspirado en el ícono del curso).
export const PhysicalHazardIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M22 50 L30 88 L70 88 L78 50" />
    <path d="M38 52 L42 88 M50 52 L50 88 M62 52 L58 88" />
    <path d="M18 52 C14 40 24 30 34 34 C36 22 52 18 60 28 C70 22 86 32 82 46 C82 50 80 52 78 52 L22 52" />
    <path d="M56 36 L74 10" />
    <circle cx={76} cy={8} r={5} fill={p.color ?? colors.white} />
    <path d="M30 42 L32 44 M46 38 L48 40 M68 42 L70 44" />
  </LineIcon>
);

// Peligro químico: frasco de laboratorio con una gota.
export const ChemicalHazardIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M30 10 L50 10 M34 10 L34 36 L12 80 C10 86 14 90 20 90 L58 90" />
    <path d="M46 10 L46 36 L56 56" />
    <path d="M18 70 C28 64 38 76 50 70" />
    <path d="M74 44 C74 44 90 62 90 72 C90 81 83 88 74 88 C65 88 58 81 58 72 C58 62 74 44 74 44 Z" />
    <path d="M68 74 C68 78 70 80 74 81" />
  </LineIcon>
);
