import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { Apple } from '../components/Produce';
import { colors, fonts } from '../theme';
import { at } from './timing';

const APPLE_CENTER = { x: 960, y: 700 };
const APPLE_SIZE = 400;
const LENS_R = 150;
const MAGNIFY = 1.8;

// Microorganismos "dentro" del alimento, en coordenadas relativas a la manzana (0–1).
const GERMS = [
  { u: 0.36, v: 0.44, kind: 'rod', rot: 30 },
  { u: 0.42, v: 0.52, kind: 'dot' },
  { u: 0.31, v: 0.55, kind: 'dot' },
  { u: 0.47, v: 0.42, kind: 'dot' },
  { u: 0.40, v: 0.62, kind: 'rod', rot: -20 },
  { u: 0.52, v: 0.56, kind: 'rod', rot: 70 },
  { u: 0.56, v: 0.48, kind: 'dot' },
  { u: 0.34, v: 0.66, kind: 'dot' },
  { u: 0.58, v: 0.64, kind: 'dot' },
  { u: 0.62, v: 0.55, kind: 'rod', rot: 10 },
  { u: 0.48, v: 0.70, kind: 'dot' },
  { u: 0.28, v: 0.48, kind: 'rod', rot: -60 },
] as const;

export const Scene5Contaminacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appleIn = spring({ frame: frame - at(0.6), fps, config: { damping: 11, stiffness: 120 } });
  const zoom = spring({ frame: frame - at(3.6), fps, config: { damping: 200 }, durationInFrames: 30 });
  const size = APPLE_SIZE * (1 + 0.25 * zoom) * appleIn;
  const appleLeft = APPLE_CENTER.x - size / 2;
  const appleTop = APPLE_CENTER.y - size / 2;

  // Destello que indica que el alimento "parece perfecto".
  const sparkle = interpolate(frame, [at(1.4), at(1.9), at(2.6)], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // La lupa entra desde abajo a la derecha y recorre la manzana despacio.
  const lensIn = spring({ frame: frame - at(4.2), fps, config: { damping: 200 }, durationInFrames: 26 });
  const drift = Math.max(0, frame - at(5.1));
  const lens = {
    x: interpolate(lensIn, [0, 1], [1650, 900]) + Math.sin(drift / 40) * 60,
    y: interpolate(lensIn, [0, 1], [1050, 650]) + Math.sin(drift / 55) * 25,
  };
  const toLens = (px: number, py: number) => ({
    x: lens.x + (px - lens.x) * MAGNIFY - (lens.x - LENS_R),
    y: lens.y + (py - lens.y) * MAGNIFY - (lens.y - LENS_R),
  });
  const magApple = toLens(appleLeft, appleTop);

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', top: 110, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Pill delay={-30} fontSize={68} style={{ transformOrigin: 'center' }}>
          Contaminación
        </Pill>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 260,
          width: 1400,
          textAlign: 'center',
          fontFamily: fonts.body,
          fontSize: 52,
          lineHeight: 1.3,
          color: colors.text,
        }}
      >
        <WordReveal text="Puede parecer apto," delay={at(0.4)} stagger={4} />
        <WordReveal
          text="pero presenta un **peligro para la salud.**"
          delay={at(4.4)}
          stagger={4}
          boldStyle={{ color: colors.accent }}
        />
      </div>

      <div style={{ position: 'absolute', left: appleLeft, top: appleTop }}>
        <Apple size={size} />
      </div>
      <Sparkle x={APPLE_CENTER.x - 110} y={APPLE_CENTER.y - 90} s={sparkle} />
      <Sparkle x={APPLE_CENTER.x + 120} y={APPLE_CENTER.y - 20} s={sparkle * 0.7} />

      {lensIn > 0.001 && (
        <>
          {/* Contenido ampliado dentro de la lente */}
          <div
            style={{
              position: 'absolute',
              left: lens.x - LENS_R,
              top: lens.y - LENS_R,
              width: LENS_R * 2,
              height: LENS_R * 2,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: colors.white,
            }}
          >
            <div style={{ position: 'absolute', left: magApple.x, top: magApple.y }}>
              <Apple size={size * MAGNIFY} />
            </div>
            {GERMS.map((g, i) => {
              const p = spring({ frame: frame - at(5.4) - i * 3, fps, config: { damping: 10, stiffness: 140 } });
              const pos = toLens(appleLeft + g.u * size, appleTop + g.v * size);
              const isRod = g.kind === 'rod';
              const w = isRod ? 54 : 24;
              const h = isRod ? 22 : 24;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: pos.x - w / 2,
                    top: pos.y - h / 2,
                    width: w,
                    height: h,
                    borderRadius: h / 2,
                    backgroundColor: isRod ? '#B5E655' : '#FFE14D',
                    border: '3px solid #5B2A12',
                    transform: `rotate(${isRod ? g.rot : 0}deg) scale(${p})`,
                  }}
                />
              );
            })}
            {/* Reflejo del vidrio */}
            <svg width={LENS_R * 2} height={LENS_R * 2} style={{ position: 'absolute', left: 0, top: 0 }}>
              <path
                d={`M ${LENS_R * 0.45} ${LENS_R * 0.75} A ${LENS_R * 0.8} ${LENS_R * 0.8} 0 0 1 ${LENS_R * 0.95} ${LENS_R * 0.35}`}
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          {/* Aro y mango de la lupa */}
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <line
              x1={lens.x + LENS_R * 0.78}
              y1={lens.y + LENS_R * 0.78}
              x2={lens.x + LENS_R * 1.85}
              y2={lens.y + LENS_R * 1.85}
              stroke={colors.accentDeep}
              strokeWidth={30}
              strokeLinecap="round"
            />
            <circle cx={lens.x} cy={lens.y} r={LENS_R} fill="none" stroke={colors.accent} strokeWidth={16} />
          </svg>
        </>
      )}
    </AbsoluteFill>
  );
};

const Sparkle: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <svg
    width={60}
    height={60}
    viewBox="0 0 60 60"
    style={{ position: 'absolute', left: x - 30, top: y - 30, transform: `scale(${s}) rotate(${s * 45}deg)`, opacity: s }}
  >
    <path d="M30 0 C33 22 38 27 60 30 C38 33 33 38 30 60 C27 38 22 33 0 30 C22 27 27 22 30 0 Z" fill="#FFFFFF" />
  </svg>
);
