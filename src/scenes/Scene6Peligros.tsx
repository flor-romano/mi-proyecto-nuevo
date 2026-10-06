import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { ChemicalHazardIcon, MicrobeIcon, PhysicalHazardIcon } from '../components/Icons';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

const v = voice('escena-6');
export const CUES = {
  biologico: v.w('peligro', 1),
  microorganismos: v.w('microorganismos'),
  etas: v.w('causa'),
  fisico: v.w('peligro', 2),
  elementos: v.w('elementos'),
  quimico: v.w('peligro', 3),
  sustancias: v.w('sustancias'),
};
export const POPS = [CUES.biologico, CUES.fisico, CUES.quimico];

const CIRCLE_D = 220;
const ROW_Y = 450;
const COLUMN_W = 460;

// Cada peligro entra cuando la locución lo nombra y queda destacado hasta que se nombra el siguiente.
const HAZARDS = [
  {
    label: 'Peligro biológico',
    keyword: 'Microorganismos',
    note: 'Causa más frecuente de las Enfermedades Transmitidas por Alimentos (ETAs).',
    Icon: MicrobeIcon,
    x: 480,
    enter: CUES.biologico,
    keywordAt: CUES.microorganismos,
    noteAt: CUES.etas,
  },
  {
    label: 'Peligro físico',
    keyword: 'Elementos ajenos al alimento',
    Icon: PhysicalHazardIcon,
    x: 960,
    enter: CUES.fisico,
    keywordAt: CUES.elementos,
  },
  {
    label: 'Peligro químico',
    keyword: 'Sustancias químicas',
    Icon: ChemicalHazardIcon,
    x: 1440,
    enter: CUES.quimico,
    keywordAt: CUES.sustancias,
  },
];

export const Scene6Peligros: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = useAt();

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', top: 110, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Pill delay={-30} style={{ transformOrigin: 'center' }}>
          Existen 3 tipos de peligros
        </Pill>
      </div>

      {HAZARDS.map(({ label, keyword, note, Icon, x, enter, keywordAt, noteAt }, i) => {
        const next = HAZARDS[i + 1]?.enter;
        const enterS = spring({ frame: frame - at(enter), fps, config: { damping: 10, stiffness: 120 } });
        if (enterS <= 0.001) return null;
        const smooth = { damping: 200 };
        const on = spring({ frame: frame - at(enter), fps, config: smooth, durationInFrames: 15 });
        const off = next === undefined ? 0 : spring({ frame: frame - at(next), fps, config: smooth, durationInFrames: 15 });
        const active = on - off;
        const scale = enterS * (0.82 + 0.3 * active);
        const dim = 0.35 + 0.65 * active;
        const labelIn = interpolate(frame, [at(enter) + 6, at(enter) + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div key={label} style={{ opacity: dim }}>
            <div
              style={{
                position: 'absolute',
                left: x - CIRCLE_D / 2,
                top: ROW_Y - CIRCLE_D / 2,
                width: CIRCLE_D,
                height: CIRCLE_D,
                borderRadius: '50%',
                backgroundColor: colors.pill,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${scale})`,
                boxShadow: `0 16px 36px rgba(0, 150, 210, ${0.25 * active})`,
              }}
            >
              <Icon size={130} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: x - COLUMN_W / 2,
                top: ROW_Y + CIRCLE_D * 0.62 + 16,
                width: COLUMN_W,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  ...type.subtitle,
                  color: colors.accent,
                  opacity: labelIn,
                  transform: `translateY(${(1 - labelIn) * 12}px)`,
                }}
              >
                {label}
              </div>
              <WordReveal
                text={`**${keyword}**`}
                delay={at(keywordAt)}
                stagger={4}
                style={{ marginTop: 14, ...type.subtitle, color: colors.accentDeep }}
              />
              {note && noteAt !== undefined && (
                <WordReveal
                  text={note}
                  delay={at(noteAt)}
                  stagger={2}
                  style={{ marginTop: 14, ...type.body, color: colors.text }}
                />
              )}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
