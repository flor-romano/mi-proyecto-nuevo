// Manzana simple para la escena de Contaminación.

const Svg: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
    {children}
  </svg>
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
