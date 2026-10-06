import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { IconCircle } from '../components/IconCircle';
import { ColorIcon, EyeIcon, FridgeIcon, SmellIcon, TasteIcon, TextureIcon } from '../components/Icons';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

const v = voice('escena-4');
export const CUES = {
  olor: v.w('olor'),
  textura: v.w('textura'),
  color: v.w('color'),
  sabor: v.w('sabor'),
  // "A simple vista se nota que no está apto..."
  simpleVista: v.w('a'),
  mala: v.w('mala'),
  temperaturas: v.w('temperaturas'),
  altas: v.w('altas'),
  bajas: v.w('bajas'),
  vidaUtil: v.w('vida'),
  vencimiento: v.w('fecha'),
};
export const POPS = [
  CUES.olor, CUES.textura, CUES.color, CUES.sabor, CUES.simpleVista,
  CUES.mala, CUES.temperaturas, CUES.vidaUtil, CUES.vencimiento,
];

// Espacio reservado para el corte de carne (fresco → alterado), que se agrega en Premiere.
// No se dibuja nada en este rectángulo.
export const MEAT_AREA = { x: 1100, y: 140, w: 700, h: 500 };

const SENSES = [
  { label: 'Olor', Icon: SmellIcon, time: CUES.olor },
  { label: 'Textura', Icon: TextureIcon, time: CUES.textura },
  { label: 'Color', Icon: ColorIcon, time: CUES.color },
  { label: 'Sabor', Icon: TasteIcon, time: CUES.sabor },
];
const SENSE_D = 150;
const SENSE_STEP = 215;

const CAUSE_W = 520;
const CAUSE_GAP = 30;
const CAUSES_TOP = 700;
const CAUSES = [
  { label: 'Mala conservación', time: CUES.mala },
  { label: 'Temperaturas muy altas o muy bajas', time: CUES.temperaturas },
  { label: 'Fin de la vida útil', time: CUES.vidaUtil },
];

export const Scene4Alteracion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = useAt();

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', left: 150, top: 130 }}>
        <Pill delay={-30}>
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
                ...type.subtitle,
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
        <IconCircle size={76} delay={at(CUES.simpleVista)} color={colors.accentDeep}>
          <EyeIcon size={48} />
        </IconCircle>
        <WordReveal
          text="Se nota a simple vista."
          delay={at(CUES.simpleVista) + 4}
          stagger={4}
          style={{ ...type.subtitle, color: colors.text }}
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
              {i === 1 && <Thermometer upAt={at(CUES.altas)} downAt={at(CUES.bajas)} />}
              {i === 2 && <Calendar crossAt={at(CUES.vencimiento)} />}
            </IconCircle>
            <span style={{ ...type.subtitle, color: colors.accent }}>
              {label}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Termómetro que sube (rojo) cuando se dice "altas" y baja (azul) cuando se dice "bajas".
const Thermometer: React.FC<{ upAt: number; downAt: number }> = ({ upAt, downAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = spring({ frame: frame - upAt, fps, config: { damping: 14 } });
  const down = spring({ frame: frame - downAt, fps, config: { damping: 14 } });
  const level = 0.45 + 0.45 * up - 0.75 * down;
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
