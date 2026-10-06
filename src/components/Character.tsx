const SKIN = '#F7C39C';
const SKIN_SHADE = '#EBA982';
const HAIR = '#1E2430';

type Props = { width?: number; blink?: boolean };

// Personaje pensativo (gorra blanca, mano en el mentón), recreado de la diapositiva "¿Qué es el riesgo alimentario?".
export const Character: React.FC<Props> = ({ width = 520, blink = false }) => (
  <svg width={width} height={width * 1.4} viewBox="0 0 500 700" style={{ overflow: 'visible' }}>
    {/* Cuerpo / remera */}
    <path
      d="M84 700 C88 580 116 498 200 466 L300 466 C384 498 412 580 416 700 Z"
      fill="#F4F5F7"
      stroke="#E1E4E8"
      strokeWidth={3}
    />
    <path d="M330 520 C360 560 372 620 374 700 L350 700 C348 630 340 570 330 520 Z" fill="#E4E7EB" />
    {/* Cuello */}
    <path d="M215 380 L285 380 L292 448 C270 468 230 468 208 448 Z" fill={SKIN_SHADE} />
    {/* Pelo, parte trasera */}
    <path d="M140 220 C130 320 150 370 200 384 L300 384 C350 370 372 320 360 220 Z" fill={HAIR} />
    {/* Cara */}
    <ellipse cx={250} cy={268} rx={92} ry={110} fill={SKIN} />
    <ellipse cx={160} cy={280} rx={14} ry={22} fill={SKIN_SHADE} />
    <ellipse cx={340} cy={280} rx={14} ry={22} fill={SKIN_SHADE} />
    {/* Flequillo */}
    <path d="M156 236 C170 180 230 168 282 186 C310 196 336 214 346 240 C320 222 290 214 262 214 C224 214 186 222 156 236 Z" fill={HAIR} />
    {/* Gorra */}
    <path d="M136 214 C120 130 190 70 262 74 C340 78 392 140 368 214 C300 196 210 196 136 214 Z" fill="#FFFFFF" stroke="#E3E6EA" strokeWidth={3} />
    <path d="M140 210 C210 192 300 192 366 210 L362 232 C300 214 212 214 144 232 Z" fill="#ECEEF1" />
    {/* Cejas */}
    <path d="M196 238 C208 230 222 230 232 236" stroke={HAIR} strokeWidth={6} strokeLinecap="round" fill="none" />
    <path d="M270 232 C282 226 296 228 306 238" stroke={HAIR} strokeWidth={6} strokeLinecap="round" fill="none" />
    {/* Ojos */}
    {blink ? (
      <>
        <path d="M204 266 L226 266" stroke={HAIR} strokeWidth={5} strokeLinecap="round" />
        <path d="M276 266 L298 266" stroke={HAIR} strokeWidth={5} strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx={216} cy={266} rx={8} ry={11} fill={HAIR} />
        <ellipse cx={286} cy={266} rx={8} ry={11} fill={HAIR} />
        <circle cx={219} cy={262} r={3} fill="#FFFFFF" />
        <circle cx={289} cy={262} r={3} fill="#FFFFFF" />
      </>
    )}
    {/* Nariz y boca */}
    <path d="M252 276 C248 296 246 304 256 306" stroke={SKIN_SHADE} strokeWidth={5} strokeLinecap="round" fill="none" />
    <path d="M232 334 C246 328 262 330 272 336" stroke="#B5644C" strokeWidth={5} strokeLinecap="round" fill="none" />
    {/* Brazo hacia el mentón: manga corta, brazo y antebrazo */}
    <path d="M150 600 L214 652" stroke={SKIN_SHADE} strokeWidth={58} strokeLinecap="round" />
    <path d="M214 652 L272 404" stroke={SKIN} strokeWidth={52} strokeLinecap="round" />
    <path
      d="M200 466 C150 480 112 520 100 580 C120 612 160 626 188 618 C196 570 204 520 214 482 Z"
      fill="#F4F5F7"
      stroke="#E1E4E8"
      strokeWidth={3}
    />
    {/* Mano */}
    <path
      d="M262 360 C250 352 236 356 236 372 C236 396 250 414 274 418 C300 422 324 410 326 392 C328 372 314 358 296 356 C286 355 272 356 262 360 Z"
      fill={SKIN}
    />
    <path d="M250 372 C262 366 280 366 294 370" stroke={SKIN_SHADE} strokeWidth={4} strokeLinecap="round" fill="none" />
    <path d="M254 388 C266 384 282 384 296 388" stroke={SKIN_SHADE} strokeWidth={4} strokeLinecap="round" fill="none" />
  </svg>
);
