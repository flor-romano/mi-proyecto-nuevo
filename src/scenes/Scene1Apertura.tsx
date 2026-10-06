import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { Shield } from '../components/Shield';
import { Apple, Broccoli, Lettuce, Orange, Pear, Tomato } from '../components/Produce';
import { colors, fonts, sec } from '../theme';

const SHIELD_SIZE = 420;
const CENTER = { x: 1380, y: 560 };

// Posiciones relativas al centro del escudo; aparecen en este orden.
export const PRODUCE = [
  { C: Lettuce, x: -190, y: -150, size: 220, rot: -12 },
  { C: Pear, x: 40, y: -255, size: 175, rot: 8 },
  { C: Tomato, x: 225, y: -60, size: 185, rot: 10 },
  { C: Orange, x: -235, y: 30, size: 170, rot: -6 },
  { C: Broccoli, x: 215, y: 130, size: 175, rot: 14 },
  { C: Apple, x: 110, y: 225, size: 190, rot: -8 },
];

export const Scene1Apertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shieldIn = spring({ frame: frame - sec(0.4), fps, config: { damping: 9, stiffness: 110, mass: 0.9 } });
  const float = Math.sin(frame / 22) * 6;
  const barIn = interpolate(frame, [sec(1.6), sec(2.3)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* Bloque de texto */}
      <div style={{ position: 'absolute', left: 170, top: 300, width: 860 }}>
        <Pill delay={sec(0.2)} fontSize={52}>
          Repaso
        </Pill>
        <WordReveal
          text="Seguridad alimentaria"
          delay={sec(0.6)}
          stagger={6}
          style={{
            marginTop: 36,
            fontFamily: fonts.title,
            fontWeight: 900,
            fontSize: 118,
            lineHeight: 1.02,
            color: colors.accent,
            width: 700,
          }}
        />
        <div
          style={{
            marginTop: 28,
            height: 8,
            width: 160 * barIn,
            borderRadius: 4,
            backgroundColor: colors.accentDeep,
          }}
        />
        <WordReveal
          text="Los puntos clave del curso"
          delay={sec(1.8)}
          stagger={4}
          style={{ marginTop: 28, fontFamily: fonts.body, fontWeight: 700, fontSize: 46, color: colors.textSoft }}
        />
      </div>

      {/* Frutas y verduras detrás del escudo, de a una */}
      {PRODUCE.map(({ C, x, y, size, rot }, i) => {
        const s = spring({ frame: frame - sec(1.3) - i * 7, fps, config: { damping: 11, stiffness: 120 } });
        const bob = Math.sin(frame / 26 + i) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CENTER.x + x * (0.55 + 0.45 * s) - size / 2,
              top: CENTER.y + y * (0.55 + 0.45 * s) - size / 2 + bob,
              transform: `scale(${s}) rotate(${rot * s}deg)`,
              opacity: Math.min(1, s * 2),
            }}
          >
            <C size={size} />
          </div>
        );
      })}

      {/* Escudo con check */}
      <div
        style={{
          position: 'absolute',
          left: CENTER.x - SHIELD_SIZE / 2,
          top: CENTER.y - (SHIELD_SIZE * 1.13) / 2 + float,
          transform: `scale(${shieldIn})`,
          filter: 'drop-shadow(0 18px 30px rgba(0, 110, 234, 0.15))',
        }}
      >
        <Shield size={SHIELD_SIZE} checkProgress={1} />
      </div>
    </AbsoluteFill>
  );
};
