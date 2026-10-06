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

// Producción: fábrica.
export const FactoryIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M10 88 L10 46 L30 58 L30 46 L50 58 L50 46 L70 58 L70 20 L86 20 L86 88 Z" />
    <path d="M22 72 L30 72 M42 72 L50 72 M62 72 L70 72" />
    <path d="M74 12 C74 8 80 8 80 4" />
  </LineIcon>
);

// Traslado: camión.
export const TruckIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <rect x={6} y={28} width={54} height={40} rx={4} />
    <path d="M60 40 L78 40 L92 56 L92 68 L60 68" />
    <circle cx={24} cy={74} r={8} />
    <circle cx={76} cy={74} r={8} />
  </LineIcon>
);

// Almacenamiento: cajas apiladas.
export const BoxesIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <rect x={10} y={52} width={38} height={36} rx={3} />
    <rect x={52} y={52} width={38} height={36} rx={3} />
    <rect x={31} y={14} width={38} height={36} rx={3} />
    <path d="M24 52 L24 62 L34 62 L34 52 M66 52 L66 62 L76 62 L76 52 M45 14 L45 24 L55 24 L55 14" />
  </LineIcon>
);

// Exhibición: góndola con productos.
export const StoreIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M14 10 L14 90 M86 10 L86 90 M14 38 L86 38 M14 66 L86 66 M10 90 L90 90" />
    <rect x={22} y={20} width={14} height={18} rx={2} />
    <rect x={42} y={24} width={14} height={14} rx={2} />
    <circle cx={70} cy={30} r={8} />
    <rect x={24} y={50} width={18} height={16} rx={2} />
    <path d="M54 66 L54 52 C54 46 66 46 66 52 L66 66" />
  </LineIcon>
);

// Personas: manos.
export const HandsIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p} strokeWidth={4.5}>
    <path d="M44 90 L44 70 C44 60 30 54 26 44 L18 26 C16 20 24 17 27 23 L34 38" />
    <path d="M34 38 L28 14 C27 8 35 6 37 12 L42 34 M42 34 L42 10 C42 4 50 4 50 10 L50 50" />
    <path d="M56 90 L56 70 C56 60 70 54 74 44 L82 26 C84 20 76 17 73 23 L66 38" />
    <path d="M66 38 L72 14 C73 8 65 6 63 12 L58 34 M58 34 L58 10 C58 4 50 4 50 10" />
  </LineIcon>
);

// Limpieza y desinfección: gota con destello.
export const DropSparkleIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M42 14 C42 14 18 44 18 62 C18 76 29 88 42 88 C55 88 66 76 66 62 C66 44 42 14 42 14 Z" />
    <path d="M32 64 C32 70 36 76 42 77" />
    <path d="M78 12 L78 32 M68 22 L88 22" />
    <path d="M84 44 L84 54 M79 49 L89 49" />
  </LineIcon>
);

// Control del frío: copo de nieve.
export const SnowflakeIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M50 8 L50 92 M14 29 L86 71 M14 71 L86 29" />
    <path d="M40 14 L50 24 L60 14 M40 86 L50 76 L60 86" />
    <path d="M14 42 L27 36 L23 22 M86 58 L73 64 L77 78" />
    <path d="M14 58 L27 64 L23 78 M86 42 L73 36 L77 22" />
  </LineIcon>
);

// Plagas: hormiga con señal de alerta.
export const AntAlertIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p} strokeWidth={4.5}>
    <ellipse cx={22} cy={62} rx={9} ry={8} />
    <ellipse cx={40} cy={62} rx={8} ry={6} />
    <ellipse cx={60} cy={62} rx={13} ry={10} />
    <path d="M16 55 L8 44 M24 55 L26 42" />
    <path d="M36 66 L28 80 M40 68 L40 82 M44 66 L52 80 M36 58 L28 48 M44 58 L50 48" />
    <path d="M78 10 L96 42 L60 42 Z" />
    <path d="M78 22 L78 32" />
    <circle cx={78} cy={37} r={1.5} fill={p.color ?? colors.white} />
  </LineIcon>
);

// Contaminación cruzada: dos alimentos unidos por una flecha.
export const CrossContaminationIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <path d="M10 56 C8 40 22 32 30 40 C38 32 52 40 50 56 C48 70 38 78 30 74 C22 78 12 70 10 56 Z" />
    <path d="M30 40 C30 32 34 28 38 26" />
    <circle cx={22} cy={54} r={2.5} fill={p.color ?? colors.white} />
    <circle cx={34} cy={60} r={2.5} fill={p.color ?? colors.white} />
    <path d="M60 70 L90 70 C92 58 84 50 75 50 C66 50 58 58 60 70 Z" />
    <path d="M56 70 L94 70" />
    <path d="M44 24 C56 12 72 14 80 28 M80 28 L80 16 M80 28 L68 28" />
  </LineIcon>
);

// Lista de control: portapapeles.
export const ClipboardIcon: React.FC<IconProps> = (p) => (
  <LineIcon {...p}>
    <rect x={20} y={14} width={60} height={78} rx={6} />
    <rect x={36} y={8} width={28} height={14} rx={4} />
    <path d="M32 40 L38 46 L48 34 M56 40 L70 40" />
    <path d="M32 60 L38 66 L48 54 M56 60 L70 60" />
    <path d="M32 80 L70 80" />
  </LineIcon>
);
