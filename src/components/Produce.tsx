// Frutas y verduras simples, inspiradas en la ilustración de la diapositiva de Inocuidad.

const Svg: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
    {children}
  </svg>
);

export const Pear: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg size={size}>
    <path d="M100 20 C108 6 112 2 116 0" stroke="#5B3A1E" strokeWidth={6} strokeLinecap="round" fill="none" />
    <path
      d="M100 22 C84 22 78 46 74 70 C70 92 40 110 40 145 C40 178 68 196 100 196 C132 196 160 178 160 145 C160 110 130 92 126 70 C122 46 116 22 100 22 Z"
      fill="#CFE36A"
    />
    <path d="M128 110 C146 124 150 150 140 172" stroke="#B6CE4C" strokeWidth={8} fill="none" strokeLinecap="round" />
  </Svg>
);

export const Lettuce: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg size={size}>
    <circle cx={100} cy={105} r={88} fill="#B9DE84" />
    <path d="M30 80 C60 40 140 40 170 80 C150 70 120 64 100 68 C80 64 50 70 30 80 Z" fill="#CDE9A2" />
    <path d="M100 190 L100 70 M100 120 L60 85 M100 120 L140 85 M100 155 L52 125 M100 155 L148 125" stroke="#E4F4CB" strokeWidth={5} strokeLinecap="round" fill="none" />
  </Svg>
);

export const Orange: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg size={size}>
    <circle cx={100} cy={110} r={80} fill="#F8A72A" />
    <circle cx={74} cy={84} r={18} fill="#FBC15E" opacity={0.7} />
    <path d="M96 32 C70 20 46 30 36 48 C60 56 84 50 96 32 Z" fill="#3E9A3A" />
  </Svg>
);

export const Tomato: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg size={size}>
    <ellipse cx={100} cy={112} rx={86} ry={78} fill="#EE4A33" />
    <ellipse cx={70} cy={86} rx={20} ry={12} fill="#F57A62" opacity={0.8} transform="rotate(-30 70 86)" />
    <path d="M100 44 L112 20 L118 46 L146 40 L126 58 L144 74 L114 66 L100 84 L90 64 L60 72 L76 54 L58 38 L88 44 Z" fill="#2F9C3E" />
  </Svg>
);

export const Apple: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg size={size}>
    <path
      d="M100 54 C80 36 30 36 24 92 C18 150 60 196 100 182 C140 196 182 150 176 92 C170 36 120 36 100 54 Z"
      fill="#DE2E25"
    />
    <path d="M100 54 C100 40 104 26 112 18" stroke="#5B3A1E" strokeWidth={6} strokeLinecap="round" fill="none" />
    <path d="M110 30 C130 10 160 14 168 22 C150 40 126 40 110 30 Z" fill="#2F9C3E" />
    <ellipse cx={62} cy={90} rx={14} ry={24} fill="#EE6A5E" opacity={0.6} transform="rotate(20 62 90)" />
  </Svg>
);

export const Broccoli: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <Svg size={size}>
    <path d="M86 120 L78 196 L124 196 L114 120 Z" fill="#9CC86A" />
    <circle cx={64} cy={96} r={40} fill="#4F9A36" />
    <circle cx={136} cy={96} r={40} fill="#4F9A36" />
    <circle cx={100} cy={64} r={46} fill="#5DAA40" />
    <circle cx={100} cy={112} r={34} fill="#5DAA40" />
    <circle cx={86} cy={54} r={10} fill="#78BE57" />
    <circle cx={120} cy={70} r={8} fill="#78BE57" />
    <circle cx={60} cy={90} r={8} fill="#6AB24C" />
  </Svg>
);
