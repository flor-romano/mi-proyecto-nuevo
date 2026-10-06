import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { Background } from './components/Background';
import { Scene1Apertura } from './scenes/Scene1Apertura';
import { Scene2Inocuidad } from './scenes/Scene2Inocuidad';
import { Scene3Riesgo } from './scenes/Scene3Riesgo';
import { HALF, TRANSITION } from './scenes/timing';
import { sec } from './theme';

// Tiempos del guion (en segundos): cada escena empieza en su minuto exacto.
const SCENES = [
  { C: Scene1Apertura, start: 0, end: 7 },
  { C: Scene2Inocuidad, start: 7, end: 27 },
  { C: Scene3Riesgo, start: 27, end: 36 },
];

export const TOTAL_FRAMES = sec(SCENES[SCENES.length - 1].end);

// Con transiciones solapadas, cada secuencia dura su tramo del guion más media
// transición a cada lado (la primera no tiene lado izquierdo, la última no tiene derecho).
const duration = (i: number) => {
  const base = sec(SCENES[i].end - SCENES[i].start);
  const left = i > 0 ? HALF : 0;
  const right = i < SCENES.length - 1 ? HALF : 0;
  return base + left + right;
};

const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION });

export const SeguridadAlimentaria: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      {SCENES.flatMap(({ C }, i) => {
        const items = [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={duration(i)}>
            <C />
          </TransitionSeries.Sequence>,
        ];
        if (i < SCENES.length - 1) {
          items.push(
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={slide({ direction: 'from-right' })}
              timing={timing}
            />,
          );
        }
        return items;
      })}
    </TransitionSeries>
  </AbsoluteFill>
);
