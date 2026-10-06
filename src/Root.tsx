import { Composition } from 'remotion';
import { SeguridadAlimentaria, TOTAL_FRAMES } from './Video';
import { FPS } from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SeguridadAlimentaria"
    component={SeguridadAlimentaria}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
