import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { Shield } from '../components/Shield';
import { colors, fonts } from '../theme';
import { at } from './timing';

const SHIELD_SIZE = 380;
const CENTER = { x: 1400, y: 580 };

// Etiquetas alrededor del escudo, sincronizadas con "normas, prácticas y procedimientos".
const TAGS = [
  { label: 'Normas', x: 1010, y: 300, anchor: { x: 1270, y: 420 }, time: 8.4 },
  { label: 'Prácticas', x: 1700, y: 470, anchor: { x: 1575, y: 520 }, time: 9.1 },
  { label: 'Procedimientos', x: 990, y: 840, anchor: { x: 1320, y: 700 }, time: 9.9 },
];

export const Scene2Inocuidad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const check = interpolate(frame, [at(1.4), at(2.4)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const float = Math.sin(frame / 22) * 6;

  return (
    <AbsoluteFill>
      {/* El título y el escudo ya están en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', left: 150, top: 170 }}>
        <Pill delay={-30} fontSize={68}>
          Inocuidad
        </Pill>
      </div>
      <WordReveal
        text="Un alimento **inocuo** no causa daño a la salud de quien lo consume."
        delay={at(0.3)}
        stagger={4}
        style={{
          position: 'absolute',
          left: 150,
          top: 380,
          width: 800,
          fontFamily: fonts.body,
          fontWeight: 400,
          fontSize: 66,
          lineHeight: 1.3,
          color: colors.text,
        }}
        boldStyle={{ color: colors.accent }}
      />

      {/* Líneas punteadas hacia el escudo */}
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {TAGS.map(({ x, y, anchor, time }, i) => {
          const p = interpolate(frame, [at(time) + 6, at(time) + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const ex = anchor.x;
          const ey = anchor.y;
          return (
            <g key={i} opacity={p}>
              <line
                x1={x}
                y1={y}
                x2={x + (ex - x) * p}
                y2={y + (ey - y) * p}
                stroke={colors.pill}
                strokeWidth={4}
                strokeDasharray="4 12"
                strokeLinecap="round"
              />
              <circle cx={ex} cy={ey} r={9 * p} fill={colors.accentDeep} />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CENTER.x - SHIELD_SIZE / 2,
          top: CENTER.y - (SHIELD_SIZE * 1.13) / 2 + float,
          filter: 'drop-shadow(0 18px 30px rgba(0, 110, 234, 0.15))',
        }}
      >
        <Shield size={SHIELD_SIZE} checkProgress={check} />
      </div>

      {TAGS.map(({ label, x, y, time }, i) => {
        const s = spring({ frame: frame - at(time), fps, config: { damping: 11, stiffness: 140 } });
        const bob = Math.sin(frame / 24 + i * 2) * 4;
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: x,
              top: y + bob,
              transform: `translate(-50%, -50%) scale(${s})`,
              opacity: Math.min(1, s * 2),
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 30px 16px 16px',
              backgroundColor: colors.white,
              border: `3px solid ${colors.sky}`,
              borderRadius: 60,
              boxShadow: '0 12px 28px rgba(0, 150, 210, 0.16)',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.accentDeep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width={30} height={30} viewBox="0 0 30 30">
                <path d="M7 15 L13 21 L23 9" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 44, color: colors.accent }}>{label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
