import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { Shield } from '../components/Shield';
import { CheckBadge } from '../components/CheckBadge';
import { colors, fonts } from '../theme';
import { at } from './timing';

const SHIELD_SIZE = 380;
const CENTER = { x: 1560, y: 580 };

// Columna de etiquetas a la izquierda del escudo, sincronizada con "normas, prácticas y procedimientos".
const TAGS_LEFT = 870;
const TAG_HEIGHT = 88;
const TAG_GAP = 44;
const TAGS = [
  { label: 'Normas', time: 8.4 },
  { label: 'Prácticas', time: 9.1 },
  { label: 'Procedimientos', time: 9.9 },
];
const COLUMN_TOP = CENTER.y - (TAGS.length * TAG_HEIGHT + (TAGS.length - 1) * TAG_GAP) / 2;

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
          width: 640,
          fontFamily: fonts.body,
          fontWeight: 400,
          fontSize: 62,
          lineHeight: 1.3,
          color: colors.text,
        }}
        boldStyle={{ color: colors.accent }}
      />

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

      {TAGS.map(({ label, time }, i) => {
        const p = spring({ frame: frame - at(time), fps, config: { damping: 200 }, durationInFrames: 18 });
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: TAGS_LEFT,
              top: COLUMN_TOP + i * (TAG_HEIGHT + TAG_GAP),
              height: TAG_HEIGHT,
              boxSizing: 'border-box',
              transform: `translateX(${(1 - p) * -60}px)`,
              opacity: p,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 30px 0 16px',
              backgroundColor: colors.white,
              border: `3px solid ${colors.sky}`,
              borderRadius: TAG_HEIGHT / 2,
              boxShadow: '0 12px 28px rgba(0, 150, 210, 0.16)',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckBadge />
            <span style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 44, color: colors.accent }}>{label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
