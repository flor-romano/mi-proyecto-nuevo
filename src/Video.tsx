import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { Background } from './components/Background';
import { VoiceCaptions } from './components/VoiceCaptions';
import * as S1 from './scenes/Scene1Apertura';
import * as S2 from './scenes/Scene2Inocuidad';
import * as S3 from './scenes/Scene3Riesgo';
import * as S4 from './scenes/Scene4Alteracion';
import * as S5 from './scenes/Scene5Contaminacion';
import * as S6 from './scenes/Scene6Peligros';
import { HALF, LEAD_IN, TAIL, TRANSITION, VoiceStart } from './scenes/timing';
import { sec } from './theme';
import { SceneKey, voice } from './voice';

// Cada escena dura lo que su locución, más LEAD_IN antes y TAIL después.
const SCENE_DEFS: { key: SceneKey; C: React.FC; pops: number[] }[] = [
  { key: 'escena-1', C: S1.Scene1Apertura, pops: S1.POPS },
  { key: 'escena-2', C: S2.Scene2Inocuidad, pops: S2.POPS },
  { key: 'escena-3', C: S3.Scene3Riesgo, pops: S3.POPS },
  { key: 'escena-4', C: S4.Scene4Alteracion, pops: S4.POPS },
  { key: 'escena-5', C: S5.Scene5Contaminacion, pops: S5.POPS },
  { key: 'escena-6', C: S6.Scene6Peligros, pops: S6.POPS },
];

const SCENES = SCENE_DEFS.reduce<(typeof SCENE_DEFS[number] & { start: number; length: number })[]>((acc, def) => {
  const prev = acc[acc.length - 1];
  const start = prev ? prev.start + prev.length : 0;
  const length = sec(LEAD_IN + voice(def.key).duration + TAIL);
  return [...acc, { ...def, start, length }];
}, []);

export const TOTAL_FRAMES = SCENES[SCENES.length - 1].start + SCENES[SCENES.length - 1].length;

// Con transiciones solapadas, cada secuencia dura su tramo más media transición a cada lado
// (la primera no tiene lado izquierdo y la última no tiene lado derecho).
const left = (i: number) => (i > 0 ? HALF : 0);
const right = (i: number) => (i < SCENES.length - 1 ? HALF : 0);

const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION });

export const SeguridadAlimentaria: React.FC<{ showCaptions?: boolean }> = ({ showCaptions = false }) => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      {SCENES.flatMap(({ C, length }, i) => {
        const items = [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={length + left(i) + right(i)}>
            <VoiceStart.Provider value={left(i) + sec(LEAD_IN)}>
              <C />
            </VoiceStart.Provider>
          </TransitionSeries.Sequence>,
        ];
        if (i < SCENES.length - 1) {
          items.push(
            <TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: 'from-right' })} timing={timing} />,
          );
        }
        return items;
      })}
    </TransitionSeries>

    {/* Locución */}
    {SCENES.map(({ key, start }) => (
      <Sequence key={key} from={start + sec(LEAD_IN)} layout="none">
        <Audio src={staticFile(`audio/${key}.mp3`)} />
      </Sequence>
    ))}

    {/* Whoosh en cada transición, centrado en el corte */}
    {SCENES.slice(1).map(({ key, start }) => (
      <Sequence key={`whoosh-${key}`} from={start - HALF} layout="none">
        <Audio src={staticFile('sfx/whoosh.wav')} />
      </Sequence>
    ))}

    {/* Pop cuando aparece un ícono, etiqueta o check */}
    {SCENES.flatMap(({ key, start, pops }) =>
      pops.map((t, j) => (
        <Sequence key={`pop-${key}-${j}`} from={Math.max(0, start + sec(LEAD_IN + t))} layout="none">
          <Audio src={staticFile(`sfx/pop-${(j % 3) + 1}.wav`)} />
        </Sequence>
      )),
    )}

    {showCaptions &&
      SCENES.map(({ key, start, length }) => (
        <Sequence key={`cc-${key}`} from={start} durationInFrames={length} layout="none">
          <VoiceCaptions sceneKey={key} voiceFrame={sec(LEAD_IN)} />
        </Sequence>
      ))}
  </AbsoluteFill>
);
