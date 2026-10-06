import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { FRUITS, SHIELD_CENTER, ShieldArt } from '../components/ShieldArt';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

const SCALE = 0.72;
const CENTER = { x: 1380, y: 560 };
// Orden de aparición de las frutas (índices de FRUITS): pera, naranja, manzana, brócoli.
const FRUIT_ORDER = [1, 0, 2, 3];

// "Repasemos juntos los puntos clave del curso de seguridad alimentaria."
const v = voice('escena-1');
export const CUES = {
  shield: -0.3,
  repaso: v.w('repasemos'),
  subtitle: [v.w('los'), v.w('puntos'), v.w('clave'), v.w('del'), v.w('curso')],
  title: [v.w('seguridad'), v.w('alimentaria')],
};
export const POPS = [CUES.shield];

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

      {/* Escudo con check y frutas y verduras, que aparecen detrás de a una */}
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
          fruitsIn={FRUITS.map((_, i) =>
            spring({
              frame: frame - at(CUES.shield) - 20 - FRUIT_ORDER.indexOf(i) * 8,
              fps,
              config: { damping: 11, stiffness: 120 },
            }),
          )}
        />
      </div>
    </AbsoluteFill>
  );
};
