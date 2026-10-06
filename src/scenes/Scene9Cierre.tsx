import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WordReveal } from '../components/WordReveal';
import { FRUITS, SHIELD_CENTER, ShieldArt } from '../components/ShieldArt';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

// "Cuidar la inocuidad de los alimentos es cuidar la salud de nuestros clientes y la nuestra.
// ¡Gracias por tu compromiso!"
const v = voice('escena-9');
const cuidar2 = v.w('cuidar', 2);
export const CUES = {
  shield: -0.3,
  // Placa: "Cuidar los alimentos es cuidar la salud de todos."
  subtitle: [
    v.w('cuidar'), v.w('los'), v.w('alimentos'), v.w('es'), cuidar2,
    v.after('la', cuidar2), v.w('salud'), v.after('de', cuidar2), v.w('nuestros'),
  ],
  // Placa: "¡Gracias por tu compromiso!"
  title: [v.w('gracias'), v.w('por'), v.w('tu'), v.w('compromiso')],
};
export const POPS = [CUES.shield, CUES.title[0]];

const SCALE = 0.72;
const CENTER = { x: 1380, y: 560 };
const FRUIT_ORDER = [1, 0, 2, 3];

export const Scene9Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = useAt();

  const shieldIn = spring({ frame: frame - at(CUES.shield), fps, config: { damping: 9, stiffness: 110, mass: 0.9 } });
  const float = Math.sin(frame / 22) * 6;
  // El check brilla cuando se dice "¡Gracias...!".
  const g = at(CUES.title[0]);
  const glow = interpolate(frame, [g, g + 10, g + 30, g + 60], [0, 1, 0.45, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sparkle = interpolate(frame, [g, g + 12, g + 34], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 170, top: 330, width: 820 }}>
        <WordReveal text="¡Gracias por tu compromiso!" times={CUES.title.map(at)} style={{ ...type.cover, color: colors.accent, width: 760 }} />
        <WordReveal
          text="Cuidar los alimentos es cuidar la salud de todos."
          times={CUES.subtitle.map(at)}
          style={{ marginTop: 36, ...type.subtitle, color: colors.textSoft, width: 720 }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: CENTER.x - SHIELD_CENTER.x * SCALE,
          top: CENTER.y - SHIELD_CENTER.y * SCALE + float,
          filter: 'drop-shadow(0 18px 30px rgba(0, 110, 234, 0.15))',
        }}
      >
        <ShieldArt
          scale={SCALE}
          shieldIn={shieldIn}
          glow={glow}
          fruitsIn={FRUITS.map((_, i) =>
            spring({ frame: frame - at(CUES.shield) - 12 - FRUIT_ORDER.indexOf(i) * 6, fps, config: { damping: 11, stiffness: 120 } }),
          )}
        />
      </div>

      {/* Destellos alrededor del check */}
      {[
        { x: -120, y: -110, s: 1 },
        { x: 130, y: -80, s: 0.8 },
        { x: 110, y: 110, s: 0.6 },
        { x: -100, y: 90, s: 0.7 },
      ].map(({ x, y, s }, i) => (
        <svg
          key={i}
          width={60}
          height={60}
          viewBox="0 0 60 60"
          style={{
            position: 'absolute',
            left: CENTER.x + x - 30,
            top: CENTER.y + y - 30 + float,
            transform: `scale(${sparkle * s}) rotate(${sparkle * 45}deg)`,
            opacity: sparkle,
          }}
        >
          <path d="M30 0 C33 22 38 27 60 30 C38 33 33 38 30 60 C27 38 22 33 0 30 C22 27 27 22 30 0 Z" fill={colors.accent} />
        </svg>
      ))}
    </AbsoluteFill>
  );
};
