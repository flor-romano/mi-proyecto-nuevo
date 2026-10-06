import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { IconCircle } from '../components/IconCircle';
import { ColorIcon, EyeIcon, FridgeIcon, SmellIcon, TasteIcon, TextureIcon } from '../components/Icons';
import { colors, fonts } from '../theme';
import { at } from './timing';

// Espacio reservado para el corte de carne (fresco → alterado), que se agrega en Premiere.
// No se dibuja nada en este rectángulo.
export const MEAT_AREA = { x: 1100, y: 140, w: 700, h: 500 };

const SENSES = [
  { label: 'Olor', Icon: SmellIcon, time: 2.0 },
  { label: 'Textura', Icon: TextureIcon, time: 2.6 },
  { label: 'Color', Icon: ColorIcon, time: 3.2 },
  { label: 'Sabor', Icon: TasteIcon, time: 3.8 },
];
const SENSE_D = 150;
const SENSE_STEP = 215;

const CAUSE_W = 520;
const CAUSE_GAP = 30;
const CAUSES_TOP = 700;
const CAUSES = [
  { label: 'Mala conservación', time: 9.6 },
  { label: 'Temperaturas muy altas o muy bajas', time: 11.6 },
  { label: 'Fin de la vida útil', time: 15.0 },
];

export const Scene4Alteracion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', left: 150, top: 130 }}>
        <Pill delay={-30} fontSize={68}>
          Alteración
        </Pill>
      </div>

      {/* Olor, textura, color y sabor */}
      {SENSES.map(({ label, Icon, time }, i) => {
        const labelIn = interpolate(frame, [at(time) + 6, at(time) + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: 150 + i * SENSE_STEP,
              top: 270,
              width: SENSE_D,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <IconCircle size={SENSE_D} delay={at(time)}>
              <Icon size={88} />
            </IconCircle>
            <span
              style={{
                marginTop: 16,
                fontFamily: fonts.body,
                fontWeight: 700,
                fontSize: 38,
                color: colors.accent,
                opacity: labelIn,
                transform: `translateY(${(1 - labelIn) * 12}px)`,
              }}
            >
              {label}
            </span>
          </div>
        );
      })}

      {/* Se nota a simple vista */}
      <div style={{ position: 'absolute', left: 150, top: 540, display: 'flex', alignItems: 'center', gap: 22 }}>
        <IconCircle size={76} delay={at(4.8)} color={colors.accentDeep}>
          <EyeIcon size={48} />
        </IconCircle>
        <WordReveal
          text="Se nota a simple vista."
          delay={at(5.0)}
          stagger={4}
          style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 48, color: colors.text }}
        />
      </div>

      {/* Causas */}
      {CAUSES.map(({ label, time }, i) => {
        const p = spring({ frame: frame - at(time), fps, config: { damping: 200 }, durationInFrames: 20 });
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: 150 + i * (CAUSE_W + CAUSE_GAP),
              top: CAUSES_TOP,
              width: CAUSE_W,
              height: 230,
              boxSizing: 'border-box',
              padding: '0 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              backgroundColor: colors.white,
              border: `3px solid ${colors.sky}`,
              borderRadius: 32,
              boxShadow: '0 14px 32px rgba(0, 150, 210, 0.14)',
              opacity: p,
              transform: `translateY(${(1 - p) * 50}px)`,
            }}
          >
            <IconCircle size={140} delay={at(time) + 4}>
              {i === 0 && <FridgeIcon size={86} />}
              {i === 1 && <Thermometer start={at(time) + 10} />}
              {i === 2 && <Calendar crossAt={at(16.4)} />}
            </IconCircle>
            <span style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: colors.accent }}>
              {label}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Termómetro que sube (rojo) y baja (azul).
const Thermometer: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - start);
  // Sube, baja y sigue oscilando suave.
  const level = 0.5 - 0.42 * Math.cos((t / 75) * Math.PI) * Math.min(1, t / 20);
  const fill = interpolateColors(level, [0.15, 0.85], [colors.accentDeep, '#F0503C']);
  const top = 70 - level * 56;
  return (
    <svg width={86} height={86} viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round">
      <rect x={40} y={8} width={20} height={68} rx={10} fill="#FFFFFF" />
      <circle cx={50} cy={80} r={14} fill="#FFFFFF" />
      <rect x={45} y={top} width={10} height={80 - top} rx={5} fill={fill} stroke="none" />
      <circle cx={50} cy={80} r={9} fill={fill} stroke="none" />
      <path d="M68 20 L76 20 M68 34 L76 34 M68 48 L76 48 M68 62 L76 62" />
    </svg>
  );
};

// Calendario con una fecha que se tacha (vencimiento).
const Calendar: React.FC<{ crossAt: number }> = ({ crossAt }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [crossAt, crossAt + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const cells = [0, 1, 2].flatMap((c) => [0, 1].map((r) => ({ cx: 30 + c * 20, cy: 52 + r * 18 })));
  return (
    <svg width={86} height={86} viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
      <rect x={14} y={20} width={72} height={66} rx={8} />
      <path d="M14 38 L86 38" />
      <path d="M32 12 L32 26 M68 12 L68 26" />
      {cells.map(({ cx, cy }, i) => (
        <rect key={i} x={cx - 6} y={cy - 5} width={12} height={10} rx={2} fill="#FFFFFF" stroke="none" opacity={i === 5 ? 0 : 0.9} />
      ))}
      <path
        d="M62 62 L78 78 M78 62 L62 78"
        stroke="#F0503C"
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - x}
        opacity={x > 0.01 ? 1 : 0}
      />
    </svg>
  );
};
