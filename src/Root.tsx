import { Composition } from "remotion";
import { PlacaIntro } from "./PlacaIntro";
import { Placa2 } from "./Placa2";
import { FPS, PLACA, PLACA2 } from "./config";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PlacaIntro"
      component={PlacaIntro}
      durationInFrames={Math.round(PLACA.duracion * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Placa2"
      component={Placa2}
      durationInFrames={Math.round(PLACA2.duracion * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
