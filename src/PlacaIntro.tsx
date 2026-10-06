import React from "react";
import { Easing, interpolate } from "remotion";
import { COLORES, PLACA } from "./config";
import { Decoracion, Placa } from "./componentes/Fondo";
import { BloqueTexto, Subtitulo, Titulo } from "./componentes/Texto";
import { clamp, easeOut, useSegundos } from "./componentes/util";

const T = PLACA.tiempos;

// Ícono de play: escala 0 → 110% → 100%.
const Play: React.FC = () => {
  const { t } = useSegundos();
  const { inicio, fin } = T.play;
  const medio = inicio + (fin - inicio) * 0.6;
  const escala =
    t < medio
      ? interpolate(t, [inicio, medio], [0, 1.1], { ...clamp, easing: easeOut })
      : interpolate(t, [medio, fin], [1.1, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const tam = 96;

  return (
    <div
      style={{
        position: "absolute",
        left: 960 - tam / 2,
        top: 318,
        width: tam,
        height: tam,
        borderRadius: "50%",
        background: COLORES.acento,
        transform: `scale(${escala})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={38} height={42} viewBox="0 0 38 42" style={{ marginLeft: 7 }}>
        <path
          d="M 4 4 L 34 21 L 4 38 Z"
          fill={COLORES.texto}
          stroke={COLORES.texto}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const PlacaIntro: React.FC = () => (
  <Placa salida={T.salida}>
    <Decoracion tramas={T.tramas} flechas={{ dibujo: T.flechas, balanceoDesde: T.flechas.fin }} />
    <Play />
    <BloqueTexto>
      <Titulo texto={PLACA.titulo} inicio={T.titulo.inicio} />
      <Subtitulo
        texto={PLACA.subtitulo}
        inicio={T.subtitulo.inicio}
        anchoMaximo={800}
        resaltar={PLACA.resaltar}
      />
    </BloqueTexto>
  </Placa>
);
