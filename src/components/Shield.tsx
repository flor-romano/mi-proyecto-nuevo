type Props = {
  size?: number;
  // 0 → check sin dibujar, 1 → check completo.
  checkProgress?: number;
  glow?: number;
};

// Escudo con check, recreado a partir de la ilustración del curso.
export const Shield: React.FC<Props> = ({ size = 420, checkProgress = 1, glow = 0 }) => (
  <svg width={size} height={size * 1.13} viewBox="0 0 300 340" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </radialGradient>
    </defs>
    <path
      d="M150 12 C196 34 244 38 284 40 L284 168 C284 246 224 298 150 330 C76 298 16 246 16 168 L16 40 C56 38 104 34 150 12 Z"
      fill="#E2F8B4"
      stroke="#C4DA2E"
      strokeWidth={7}
      strokeLinejoin="round"
    />
    <path
      d="M150 34 C188 52 228 56 262 58 L262 166 C262 232 212 276 150 304 C88 276 38 232 38 166 L38 58 C72 56 112 52 150 34 Z"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={4}
      opacity={0.55}
    />
    <circle cx={150} cy={168} r={78} fill="#A7E07E" />
    {glow > 0 && <circle cx={150} cy={168} r={78 + 50 * glow} fill="url(#shieldGlow)" opacity={1 - glow * 0.6} />}
    <path
      d="M110 170 L140 200 L194 134"
      fill="none"
      stroke="#DDF4FA"
      strokeWidth={24}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - checkProgress}
      opacity={checkProgress > 0.01 ? 1 : 0}
    />
  </svg>
);
