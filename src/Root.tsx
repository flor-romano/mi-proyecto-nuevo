import { Composition } from "remotion";
import { PlacaIntro } from "./PlacaIntro";
import { FPS, PLACA } from "./config";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PlacaIntro"
    component={PlacaIntro}
    durationInFrames={Math.round(PLACA.duracion * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
