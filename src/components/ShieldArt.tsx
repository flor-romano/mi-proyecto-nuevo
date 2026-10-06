import { useId } from 'react';
import { Img, staticFile } from 'remotion';

// Escudo y frutas originales del curso (public/ilustraciones/escudo), ubicados como en la
// ilustración completa (escudo-frutas-original.png, 844×891 px). Coordenadas en esos píxeles.
export const ART_W = 844;
export const ART_H = 891;
const SHIELD = { file: 'escudo-sin-check.png', x: 123, y: 164, w: 583, h: 619 };
const CHECK = { x: 312, y: 373, w: 205, h: 170 };
// Centro del escudo dentro de la ilustración, para ubicarlo en pantalla.
export const SHIELD_CENTER = { x: SHIELD.x + SHIELD.w / 2, y: SHIELD.y + SHIELD.h / 2 };

// Frutas y verduras, de atrás hacia adelante.
export const FRUITS = [
  { file: 'naranja.png', x: 0, y: 273, w: 257, h: 225 },
  { file: 'pera.png', x: 245, y: 0, w: 203, h: 303 },
  { file: 'manzana.png', x: 487, y: 582, w: 258, h: 309 },
  { file: 'brocoli.png', x: 593, y: 504, w: 219, h: 207 },
];

type Props = {
  // Escala respecto de la ilustración original.
  scale: number;
  // Aparición del escudo (0–1, admite rebote > 1).
  shieldIn?: number;
  // Aparición de cada fruta, en el orden de FRUITS. Si falta, no se muestra.
  fruitsIn?: number[];
  // 0 → sin check, 1 → check completo (se dibuja siguiendo su trazo).
  checkProgress?: number;
  // Brillo del check (0–1).
  glow?: number;
};

const src = (file: string) => staticFile(`ilustraciones/escudo/${file}`);

export const ShieldArt: React.FC<Props> = ({ scale, shieldIn = 1, fruitsIn = [], checkProgress = 1, glow = 0 }) => {
  // Id único: puede haber dos escudos en pantalla durante una transición.
  const maskId = `check-reveal-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const box = (p: { x: number; y: number; w: number; h: number }): React.CSSProperties => ({
    position: 'absolute',
    left: p.x * scale,
    top: p.y * scale,
    width: p.w * scale,
    height: p.h * scale,
  });

  return (
    <div style={{ position: 'relative', width: ART_W * scale, height: ART_H * scale }}>
      {FRUITS.map((f, i) => {
        const s = fruitsIn[i] ?? 0;
        if (s <= 0.001) return null;
        return (
          <Img
            key={f.file}
            src={src(f.file)}
            style={{ ...box(f), transform: `scale(${s})`, opacity: Math.min(1, s * 2) }}
          />
        );
      })}

      <div style={{ ...box({ ...SHIELD }), transform: `scale(${shieldIn})`, transformOrigin: '50% 50%' }}>
        <Img src={src(SHIELD.file)} style={{ width: '100%', height: '100%' }} />
        {glow > 0 && (
          <div
            style={{
              position: 'absolute',
              left: (CHECK.x - SHIELD.x + CHECK.w / 2) * scale,
              top: (CHECK.y - SHIELD.y + CHECK.h / 2) * scale,
              width: 420 * scale,
              height: 420 * scale,
              transform: `translate(-50%, -50%) scale(${0.6 + 0.6 * glow})`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 65%)',
              opacity: glow,
            }}
          />
        )}
        {/* Check revelado con una máscara que recorre su trazo: brazo corto y luego brazo largo. */}
        <svg
          viewBox={`0 0 ${CHECK.w} ${CHECK.h}`}
          style={{
            position: 'absolute',
            left: (CHECK.x - SHIELD.x) * scale,
            top: (CHECK.y - SHIELD.y) * scale,
            width: CHECK.w * scale,
            height: CHECK.h * scale,
            overflow: 'visible',
            opacity: checkProgress > 0.01 ? 1 : 0,
          }}
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <path
                d="M 0 70 L 72 142 L 205 0"
                stroke="#fff"
                strokeWidth={90}
                fill="none"
                strokeLinecap="butt"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - checkProgress}
              />
            </mask>
          </defs>
          <image href={src('check.png')} width={CHECK.w} height={CHECK.h} mask={`url(#${maskId})`} />
        </svg>
      </div>
    </div>
  );
};
