import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { MicrobeIcon, SpoiledMeatIcon } from '../components/Icons';
import bubblesMeta from '../../public/ilustraciones/burbujas/burbujas.json';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

// "Todo alimento que no se maneja adecuadamente está expuesto a dos riesgos: la alteración y la contaminación."
const v = voice('escena-3');
// La transformación arranca un poco antes para que la tarjeta quede armada cuando se dice la palabra.
const MORPH_LEAD = 0.35;
export const CUES = {
  // Placa: "Todo alimento mal manejado está expuesto a 2 riesgos:"
  sentence: [v.w('todo'), v.w('alimento'), v.w('no'), v.w('maneja'), v.w('está'), v.w('expuesto'), v.w('a'), v.w('dos'), v.w('riesgos')],
  bubbles: 0.1,
  alteracion: v.w('alteración'),
  contaminacion: v.w('contaminación'),
};
const BUBBLE_STAGGER = 0.2;

// Ilustración original del personaje (sin burbujas), escalada sin deformar y apoyada en el borde inferior.
const SCALE = 0.82;
const ART = {
  w: bubblesMeta.width * SCALE,
  h: bubblesMeta.height * SCALE,
};
const ART_LEFT = 1920 - ART.w - 40;
const ART_TOP = 1080 - ART.h;

// Orden en que aparecen las burbujas (índices de burbujas.json).
const POP_ORDER = [2, 1, 0, 3, 4, 5];

// Burbujas que se transforman en tarjetas. `circle` es la parte redonda de la burbuja,
// en píxeles de la ilustración original (sin el piquito).
const CARD = { x: 150, w: 780, h: 200 };
const CARDS = [
  { bubble: 2, circle: { x: 0, y: 103, d: 258 }, label: 'Alteración', Icon: SpoiledMeatIcon, y: 440, time: CUES.alteracion - MORPH_LEAD },
  { bubble: 3, circle: { x: 734, y: 165, d: 246 }, label: 'Contaminación', Icon: MicrobeIcon, y: 680, time: CUES.contaminacion - MORPH_LEAD },
];
export const POPS = [
  ...POP_ORDER.map((_, k) => CUES.bubbles + k * BUBBLE_STAGGER),
  CUES.alteracion,
  CUES.contaminacion,
];

const toScene = (x: number, y: number) => ({ x: ART_LEFT + x * SCALE, y: ART_TOP + y * SCALE });

export const Scene3Riesgo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = useAt();

  // El personaje entra subiendo con un fundido.
  const charIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', left: 150, top: 150 }}>
        <Pill delay={-30}>
          ¿Qué es el riesgo alimentario?
        </Pill>
      </div>
      <WordReveal
        text="Todo alimento mal manejado está expuesto a **2 riesgos:**"
        times={CUES.sentence.map(at)}
        style={{ position: 'absolute', left: 150, top: 290, width: 820, ...type.body, color: colors.text }}
        boldStyle={{ color: colors.accent }}
      />

      <Img
        src={staticFile('ilustraciones/personaje-pensativo.png')}
        style={{
          position: 'absolute',
          left: ART_LEFT,
          top: ART_TOP + (1 - charIn) * 80,
          width: ART.w,
          height: ART.h,
          opacity: charIn,
        }}
      />

      {/* Burbujas de diálogo, de a una con escala y rebote suave */}
      {bubblesMeta.bubbles.map((b, i) => {
        const order = POP_ORDER.indexOf(i);
        const pop = spring({ frame: frame - at(CUES.bubbles + order * BUBBLE_STAGGER), fps, config: { damping: 10, stiffness: 140 } });
        const bob = Math.sin(frame / 20 + i * 1.7) * 5;
        const card = CARDS.find((c) => c.bubble === i);
        // La burbuja que se transforma desaparece apenas arranca la transformación.
        const morphStart = card ? spring({ frame: frame - at(card.time), fps, config: { damping: 200 }, durationInFrames: 6 }) : 0;
        const pos = toScene(b.x, b.y);
        return (
          <Img
            key={b.file}
            src={staticFile(`ilustraciones/burbujas/${b.file}`)}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y + bob,
              width: b.w * SCALE,
              height: b.h * SCALE,
              transform: `scale(${pop})`,
              opacity: Math.min(1, pop * 2) * (1 - morphStart),
            }}
          />
        );
      })}

      {/* Burbuja → tarjeta */}
      {CARDS.map(({ bubble, circle, label, Icon, y, time }) => {
        const m = spring({ frame: frame - at(time), fps, config: { damping: 18, stiffness: 80 } });
        if (m <= 0.001) return null;
        const bob = Math.sin(frame / 20 + bubble * 1.7) * 5 * (1 - m);
        const start = toScene(circle.x, circle.y);
        const d = circle.d * SCALE;
        const left = interpolate(m, [0, 1], [start.x, CARD.x]);
        const top = interpolate(m, [0, 1], [start.y + bob, y]);
        const width = interpolate(m, [0, 1], [d, CARD.w]);
        const height = interpolate(m, [0, 1], [d, CARD.h]);
        const radius = interpolate(m, [0, 1], [d / 2, 32]);
        const fill = interpolate(m, [0, 0.6], [1, 0], { extrapolateRight: 'clamp' });
        const contentIn = interpolate(m, [0.55, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const labelIn = spring({ frame: frame - at(time) - 14, fps, config: { damping: 14 } });

        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              borderRadius: radius,
              backgroundColor: colors.white,
              border: `3px solid rgba(150, 220, 240, ${m})`,
              boxShadow: `0 14px 32px rgba(0, 150, 210, ${0.16 * m})`,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, backgroundColor: colors.pill, opacity: fill }} />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: CARD.w,
                height: CARD.h,
                display: 'flex',
                alignItems: 'center',
                gap: 36,
                paddingLeft: 36,
                opacity: contentIn,
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  backgroundColor: colors.pill,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${0.6 + 0.4 * labelIn})`,
                  flexShrink: 0,
                }}
              >
                <Icon size={84} />
              </div>
              <span
                style={{
                  ...type.title,
                  color: colors.accent,
                  transform: `translateX(${(1 - labelIn) * 30}px)`,
                  opacity: labelIn,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
