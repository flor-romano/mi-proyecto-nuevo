import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { Shield } from '../components/Shield';
import { Apple, Broccoli, Lettuce, Orange, Pear, Tomato } from '../components/Produce';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

const SHIELD_SIZE = 420;
const CENTER = { x: 1380, y: 560 };

// "Repasemos juntos los puntos clave del curso de seguridad alimentaria."
const v = voice('escena-1');
export const CUES = {
  shield: -0.3,
  repaso: v.w('repasemos'),
  subtitle: [v.w('los'), v.w('puntos'), v.w('clave'), v.w('del'), v.w('curso')],
  title: [v.w('seguridad'), v.w('alimentaria')],
};
export const POPS = [CUES.shield];

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
  const at = useAt();

  const shieldIn = spring({ frame: frame - at(CUES.shield), fps, config: { damping: 9, stiffness: 110, mass: 0.9 } });
  const float = Math.sin(frame / 22) * 6;
  const barIn = interpolate(frame, [at(CUES.title[0]), at(CUES.title[0]) + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Bloque de texto */}
      <div style={{ position: 'absolute', left: 170, top: 330, width: 860 }}>
        <Pill delay={at(CUES.repaso)}>Repaso</Pill>
        <WordReveal
          text="Seguridad alimentaria"
          times={CUES.title.map(at)}
          style={{ marginTop: 32, ...type.cover, color: colors.accent, width: 700 }}
        />
        <div
          style={{ marginTop: 28, height: 8, width: 160 * barIn, borderRadius: 4, backgroundColor: colors.accentDeep }}
        />
        <WordReveal
          text="Los puntos clave del curso"
          times={CUES.subtitle.map(at)}
          style={{ marginTop: 28, ...type.subtitle, color: colors.textSoft }}
        />
      </div>

      {/* Frutas y verduras detrás del escudo, de a una */}
      {PRODUCE.map(({ C, x, y, size, rot }, i) => {
        const s = spring({ frame: frame - at(CUES.shield) - 20 - i * 7, fps, config: { damping: 11, stiffness: 120 } });
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
