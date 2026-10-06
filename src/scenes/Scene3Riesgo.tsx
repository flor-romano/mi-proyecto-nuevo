import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { Character } from '../components/Character';
import { MicrobeIcon, SpoiledMeatIcon } from '../components/Icons';
import { colors, fonts } from '../theme';
import { at } from './timing';

type Bubble = { x: number; y: number; d: number; glyph: '?' | '...'; tail: number };

// Burbujas alrededor de la cabeza del personaje. Las marcadas en CARDS se transforman en tarjetas.
const BUBBLES: Bubble[] = [
  { x: 1215, y: 470, d: 190, glyph: '...', tail: 30 },
  { x: 1370, y: 270, d: 110, glyph: '...', tail: 60 },
  { x: 1620, y: 215, d: 140, glyph: '?', tail: 120 },
  { x: 1800, y: 440, d: 180, glyph: '?', tail: 150 },
  { x: 1150, y: 720, d: 110, glyph: '?', tail: 0 },
];

const CARD = { x: 150, w: 780, h: 200 };
const CARDS = [
  { bubble: 0, label: 'Alteración', Icon: SpoiledMeatIcon, y: 430, time: 3.6 },
  { bubble: 3, label: 'Contaminación', Icon: MicrobeIcon, y: 680, time: 4.6 },
];
const MORPHING = new Set(CARDS.map((c) => c.bubble));

const Glyph: React.FC<{ glyph: Bubble['glyph']; d: number }> = ({ glyph, d }) =>
  glyph === '?' ? (
    <span style={{ fontFamily: fonts.title, fontWeight: 900, fontSize: d * 0.6, color: colors.white, lineHeight: 1 }}>?</span>
  ) : (
    <div style={{ display: 'flex', gap: d * 0.09 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: d * 0.11, height: d * 0.11, borderRadius: '50%', backgroundColor: colors.white }} />
      ))}
    </div>
  );

export const Scene3Riesgo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blink = [at(2.2), at(5.8), at(7.4)].some((t) => frame >= t && frame < t + 4);
  const headTilt = Math.sin(frame / 30) * 1.2;
  // Las burbujas que no se transforman se retiran justo antes de la primera transformación.
  const othersOut = spring({ frame: frame - at(3.3), fps, config: { damping: 200 } });

  return (
    <AbsoluteFill>
      {/* El título y el personaje ya están en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', left: 150, top: 150 }}>
        <Pill delay={-30} fontSize={60}>
          ¿Qué es el riesgo alimentario?
        </Pill>
      </div>
      <WordReveal
        text="Todo alimento mal manejado está expuesto a **2 riesgos:**"
        delay={at(0.3)}
        stagger={4}
        style={{
          position: 'absolute',
          left: 150,
          top: 300,
          width: 1300,
          fontFamily: fonts.body,
          fontSize: 44,
          lineHeight: 1.3,
          color: colors.text,
        }}
        boldStyle={{ color: colors.accent }}
      />

      {/* Personaje pensativo */}
      <div
        style={{
          position: 'absolute',
          left: 1250,
          top: 352,
          transform: `rotate(${headTilt}deg)`,
          transformOrigin: '50% 100%',
        }}
      >
        <Character width={520} blink={blink} />
      </div>

      {/* Burbujas de pensamiento */}
      {BUBBLES.map((b, i) => {
        const pop = spring({ frame: frame - at(0.8) - i * 7, fps, config: { damping: 10, stiffness: 130 } });
        const bob = Math.sin(frame / 20 + i * 1.7) * 6;
        const card = CARDS.find((c) => c.bubble === i);

        if (!card) {
          const s = pop * (1 - othersOut);
          if (s <= 0.001) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: b.x - b.d / 2,
                top: b.y - b.d / 2 + bob,
                width: b.d,
                height: b.d,
                transform: `scale(${s})`,
                opacity: Math.min(1, s * 2),
              }}
            >
              <BubbleShape b={b} />
            </div>
          );
        }

        // Burbuja → tarjeta
        const m = spring({ frame: frame - at(card.time), fps, config: { damping: 18, stiffness: 80 } });
        const left = interpolate(m, [0, 1], [b.x - b.d / 2, CARD.x]);
        const top = interpolate(m, [0, 1], [b.y - b.d / 2 + bob, card.y]);
        const width = interpolate(m, [0, 1], [b.d, CARD.w]);
        const height = interpolate(m, [0, 1], [b.d, CARD.h]);
        const radius = interpolate(m, [0, 1], [b.d / 2, 32]);
        const bg = interpolateColors(m, [0, 0.6], [colors.sky, colors.white]);
        const glyphOut = interpolate(m, [0, 0.25], [1, 0], { extrapolateRight: 'clamp' });
        const contentIn = interpolate(m, [0.55, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const labelIn = spring({ frame: frame - at(card.time) - 14, fps, config: { damping: 14 } });
        const { Icon } = card;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              borderRadius: radius,
              backgroundColor: bg,
              border: `3px solid rgba(150, 220, 240, ${m})`,
              boxShadow: `0 14px 32px rgba(0, 150, 210, ${0.16 * m})`,
              transform: `scale(${pop})`,
              overflow: 'hidden',
            }}
          >
            {m < 0.05 && <BubbleTail b={b} />}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: glyphOut,
              }}
            >
              <Glyph glyph={b.glyph} d={b.d} />
            </div>
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
                  fontFamily: fonts.title,
                  fontWeight: 900,
                  fontSize: 72,
                  color: colors.accent,
                  transform: `translateX(${(1 - labelIn) * 30}px)`,
                  opacity: labelIn,
                }}
              >
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const BubbleShape: React.FC<{ b: Bubble }> = ({ b }) => (
  <div
    style={{
      position: 'relative',
      width: b.d,
      height: b.d,
      borderRadius: '50%',
      backgroundColor: colors.sky,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <BubbleTail b={b} />
    <Glyph glyph={b.glyph} d={b.d} />
  </div>
);

// Pequeño piquito de la burbuja de diálogo, orientado según `tail` (grados).
const BubbleTail: React.FC<{ b: Bubble }> = ({ b }) => {
  const r = b.d / 2;
  const rad = (b.tail * Math.PI) / 180;
  const cx = r + Math.cos(rad) * r * 0.86;
  const cy = r + Math.sin(rad) * r * 0.86;
  const size = b.d * 0.26;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        backgroundColor: colors.sky,
        transform: `rotate(${b.tail + 45}deg)`,
        borderRadius: 4,
      }}
    />
  );
};
