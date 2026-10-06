import { AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { IconCircle } from '../components/IconCircle';
import { ClipboardIcon } from '../components/Icons';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

// "Antes de vender o entregar un alimento, preguntate: ¿está en buen estado, bien conservado
// y bien manipulado? Si tenés dudas, no lo entregues y consultá a tu responsable."
const v = voice('escena-8');
export const CUES = {
  clipboard: v.w('antes'),
  list: v.w('preguntate'),
  checks: [v.w('buen'), v.w('conservado'), v.w('manipulado')],
  doubt: v.w('si'),
  consult: v.w('consultá'),
};
export const POPS = [CUES.clipboard, ...CUES.checks];

const QUESTIONS = ['¿Está en buen estado?', '¿Está bien conservado?', '¿Está bien manipulado?'];
const ROW_H = 112;
const ROW_GAP = 24;
const BOX = 68;

export const Scene8Practica: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = useAt();

  // "Si tenés dudas, no lo entregues: consultá a tu responsable."
  const messageTimes: (number | undefined)[] = [];
  messageTimes[0] = at(CUES.doubt);
  messageTimes[6] = at(CUES.consult);
  const calloutIn = spring({ frame: frame - at(CUES.doubt) + 4, fps, config: { damping: 200 }, durationInFrames: 16 });

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', left: 150, top: 150 }}>
        <Pill delay={-30}>En la práctica</Pill>
      </div>

      {/* Lista de control */}
      {QUESTIONS.map((q, i) => {
        const rowIn = spring({ frame: frame - at(CUES.list) - i * 5, fps, config: { damping: 200 }, durationInFrames: 18 });
        const check = interpolate(frame, [at(CUES.checks[i]), at(CUES.checks[i]) + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.cubic),
        });
        const boxPop = spring({ frame: frame - at(CUES.checks[i]), fps, config: { damping: 9, stiffness: 160 } });
        return (
          <div
            key={q}
            style={{
              position: 'absolute',
              left: 150,
              top: 300 + i * (ROW_H + ROW_GAP),
              width: 900,
              height: ROW_H,
              boxSizing: 'border-box',
              padding: '0 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              backgroundColor: colors.white,
              border: `3px solid ${interpolateColors(check, [0, 1], [colors.sky, colors.accent])}`,
              borderRadius: 28,
              boxShadow: '0 12px 28px rgba(0, 150, 210, 0.12)',
              opacity: rowIn,
              transform: `translateX(${(1 - rowIn) * -60}px)`,
            }}
          >
            <div
              style={{
                width: BOX,
                height: BOX,
                flexShrink: 0,
                borderRadius: 16,
                border: `5px solid ${colors.accentDeep}`,
                boxSizing: 'border-box',
                backgroundColor: interpolateColors(check, [0, 1], [colors.white, colors.accentDeep]),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${check > 0 ? 0.9 + 0.1 * boxPop : 1})`,
              }}
            >
              <svg width={44} height={44} viewBox="0 0 30 30">
                <path
                  d="M6 15 L12.5 21.5 L24 8.5"
                  stroke="#FFFFFF"
                  strokeWidth={4.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - check}
                  opacity={check > 0.01 ? 1 : 0}
                />
              </svg>
            </div>
            <span style={{ ...type.subtitle, color: colors.text }}>{q}</span>
          </div>
        );
      })}

      {/* Mensaje final */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 760,
          width: 900,
          boxSizing: 'border-box',
          padding: '28px 36px',
          backgroundColor: '#EAF8FD',
          borderLeft: `10px solid ${colors.accent}`,
          borderRadius: 20,
          opacity: calloutIn,
          transform: `translateY(${(1 - calloutIn) * 30}px)`,
        }}
      >
        <WordReveal
          text="Si tenés dudas, no lo entregues: **consultá a tu responsable.**"
          times={messageTimes}
          style={{ ...type.body, color: colors.text }}
          boldStyle={{ color: colors.accent }}
        />
      </div>

      {/* Portapapeles */}
      <div style={{ position: 'absolute', left: 1500 - 180, top: 560 - 180 }}>
        <IconCircle size={360} delay={at(CUES.clipboard)}>
          <ClipboardIcon size={220} />
        </IconCircle>
      </div>
    </AbsoluteFill>
  );
};
