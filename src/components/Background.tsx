import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors } from '../theme';

// Formas orgánicas suaves que flotan lentamente detrás de todas las escenas.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const drift = (speed: number, amp: number, phase = 0) => Math.sin(t * speed + phase) * amp;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: 'absolute' }}>
        <g
          transform={`translate(${drift(0.35, 18)}, ${drift(0.28, 14, 1)}) rotate(${drift(0.2, 2)} 1700 120)`}
          opacity={0.32}
        >
          <path
            d="M1380 -40 C1460 90 1600 140 1760 120 C1880 105 1960 170 1980 260 L1980 -40 Z"
            fill={colors.sky}
          />
        </g>
        <g transform={`translate(${drift(0.3, 14, 2)}, ${drift(0.4, 10)})`} opacity={0.22}>
          <path
            d="M1560 -40 C1600 40 1700 70 1800 50 C1880 35 1950 60 1980 110 L1980 -40 Z"
            fill={colors.pill}
          />
        </g>
        <g
          transform={`translate(${drift(0.25, 16, 3)}, ${drift(0.32, 16, 2)}) rotate(${drift(0.18, 2.5)} 150 1000)`}
          opacity={0.28}
        >
          <path
            d="M-60 760 C40 780 120 860 150 960 C170 1030 240 1080 320 1120 L-60 1120 Z"
            fill={colors.pill}
          />
        </g>
        <g transform={`translate(${drift(0.22, 12, 4)}, ${drift(0.27, 10, 1)})`} opacity={0.18}>
          <path
            d="M-60 900 C30 900 90 950 120 1010 C140 1050 190 1090 240 1120 L-60 1120 Z"
            fill={colors.sky}
          />
        </g>
        <path
          d="M1200 1120 C1260 1040 1380 1010 1500 1030 C1640 1055 1760 1010 1980 940"
          fill="none"
          stroke={colors.sky}
          strokeWidth={3}
          opacity={0.45}
          transform={`translate(${drift(0.3, 10)}, ${drift(0.25, 8, 2)})`}
        />
      </svg>
    </AbsoluteFill>
  );
};
