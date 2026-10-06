import React, { useLayoutEffect, useRef, useState } from "react";
import { interpolate, spring } from "remotion";
import { COLORES, TEXTO } from "../config";
import { clamp, easeInOut, easeOut, mezclar, useSegundos } from "./util";

// Una palabra que sube y aparece con fade. `pop` le suma una escala inicial (ej. 1.3 → 1).
const Palabra: React.FC<{
  inicio: number;
  refSpan?: (el: HTMLSpanElement | null) => void;
  children: React.ReactNode;
  color?: string;
  pop?: number;
  subrayado?: { progreso: number; extender: boolean };
}> = ({ inicio, refSpan, children, color, pop, subrayado }) => {
  const { t, frame, fps } = useSegundos();
  const k = interpolate(t, [inicio, inicio + TEXTO.duracionPalabra], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  let escala = 1;
  if (pop) {
    const s = spring({
      // Se mantiene grande mientras aparece y después se asienta en 100%.
      frame: frame - Math.round((inicio + TEXTO.duracionPalabra * 0.5) * fps),
      fps,
      config: { damping: 14, stiffness: 120 },
    });
    escala = pop + (1 - pop) * s;
  }
  return (
    <span
      ref={refSpan}
      style={{
        display: "inline-block",
        position: "relative",
        opacity: k,
        transform: `translateY(${(1 - k) * TEXTO.subidaPalabra}px) scale(${escala})`,
        color,
      }}
    >
      {children}
      {subrayado ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: -1,
            height: 3,
            borderRadius: 2,
            // Si no es la última palabra resaltada, la línea cubre también el espacio siguiente.
            width: `calc((100% + ${subrayado.extender ? "0.22em" : "0px"}) * ${subrayado.progreso})`,
            background: COLORES.resaltado,
          }}
        />
      ) : null}
    </span>
  );
};

const ConEspacios: React.FC<{ children: React.ReactNode[] }> = ({ children }) => (
  <>
    {children.map((c, i) => (
      <React.Fragment key={i}>
        {c}
        {i < children.length - 1 ? " " : null}
      </React.Fragment>
    ))}
  </>
);

export const Titulo: React.FC<{ texto: string; inicio: number }> = ({ texto, inicio }) => (
  <div style={{ fontWeight: 600, fontSize: 51, lineHeight: 1.2 }}>
    <ConEspacios>
      {texto.split(" ").map((p, i) => (
        <Palabra key={i} inicio={inicio + i * TEXTO.entrePalabras}>
          {p}
        </Palabra>
      ))}
    </ConEspacios>
  </div>
);

// Subtítulo palabra por palabra. `resaltar` cambia de color y se subraya cuando terminó
// de entrar; `pop` es una palabra que entra con escala extra.
export const Subtitulo: React.FC<{
  texto: string;
  inicio: number;
  anchoMaximo: number;
  resaltar?: string;
  pop?: { palabra: string; escala: number };
}> = ({ texto, inicio, anchoMaximo, resaltar, pop }) => {
  const { t } = useSegundos();
  const palabras = texto.split(" ");
  const inicioPalabra = (i: number) => inicio + i * TEXTO.entrePalabras;

  // Índices de las palabras resaltadas.
  const desde = resaltar ? texto.slice(0, texto.indexOf(resaltar)).split(" ").length - 1 : -1;
  const cuantas = resaltar && desde >= 0 ? resaltar.split(" ").length : 0;
  const resaltada = (i: number) => i >= desde && i < desde + cuantas;

  // Resaltado y subrayado: empiezan cuando terminó de entrar la frase destacada.
  const finFrase = inicioPalabra(desde + cuantas - 1) + TEXTO.duracionPalabra;
  const cambioColor = interpolate(t, [finFrase, finFrase + 0.35], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const subrayado = interpolate(t, [finFrase + 0.1, finFrase + 0.7], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const color = mezclar(COLORES.texto, COLORES.resaltado, cambioColor);

  // Línea de cada palabra (offsetTop no depende de los transforms), para no extender
  // el subrayado sobre el espacio cuando la frase resaltada salta de renglón.
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const [lineas, setLineas] = useState<number[]>([]);
  useLayoutEffect(() => {
    const nuevas = spans.current.map((el) => el?.offsetTop ?? 0);
    if (nuevas.join() !== lineas.join()) setLineas(nuevas);
  });
  const mismaLinea = (i: number) => lineas.length === 0 || lineas[i] === lineas[i + 1];

  // El subrayado recorre las palabras resaltadas en orden, repartido según su largo.
  const largos = palabras.slice(desde, desde + cuantas).map((p) => p.length + 1);
  const total = largos.reduce((a, b) => a + b, 0);
  const progresoPalabra = (j: number) => {
    const antes = largos.slice(0, j).reduce((a, b) => a + b, 0) / total;
    return interpolate(subrayado, [antes, antes + largos[j] / total], [0, 1], clamp);
  };

  return (
    <div style={{ fontWeight: 400, fontSize: 36, lineHeight: "42px", maxWidth: anchoMaximo }}>
      <ConEspacios>
        {palabras.map((p, i) => (
          <Palabra
            key={i}
            inicio={inicioPalabra(i)}
            refSpan={(el) => (spans.current[i] = el)}
            color={resaltada(i) ? color : undefined}
            pop={pop && p === pop.palabra ? pop.escala : undefined}
            subrayado={
              resaltada(i)
                ? { progreso: progresoPalabra(i - desde), extender: i < desde + cuantas - 1 && mismaLinea(i) }
                : undefined
            }
          >
            {p}
          </Palabra>
        ))}
      </ConEspacios>
    </div>
  );
};

// Bloque de texto centrado, en la misma posición en todas las placas.
export const BloqueTexto: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      top: 426,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      color: COLORES.texto,
      gap: 8,
    }}
  >
    {children}
  </div>
);
