import React from "react";
import { interpolate, spring } from "remotion";
import { COLORES, PLACA2 } from "./config";
import { Decoracion, Placa } from "./componentes/Fondo";
import { BloqueTexto, Subtitulo, Titulo } from "./componentes/Texto";
import { clamp, easeInOut, easeOut, useSegundos } from "./componentes/util";

const T = PLACA2.tiempos;
const M = PLACA2.movimiento;

// Local simple: toldo festoneado, frente y puerta.
const IconoSucursal: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 64 64">
    <path
      d="M 12 30 V 54 H 52 V 30"
      fill="none"
      stroke={COLORES.texto}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <rect x={27} y={38} width={10} height={16} rx={1.5} fill={COLORES.texto} />
    <path
      d="M 8 12 H 56 V 24 a 6 6 0 0 1 -12 0 a 6 6 0 0 1 -12 0 a 6 6 0 0 1 -12 0 a 6 6 0 0 1 -12 0 Z"
      fill={COLORES.texto}
      stroke={COLORES.texto}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    {/* Rayas del toldo */}
    {[20, 32, 44].map((x) => (
      <line key={x} x1={x} y1={13} x2={x} y2={24} stroke={COLORES.acento} strokeWidth={2.5} />
    ))}
    <path d="M 6 54 H 58" stroke={COLORES.texto} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

// Flecha horizontal que se dibuja; `sentido` 1 apunta a la derecha, -1 a la izquierda.
const FlechaHorizontal: React.FC<{
  y: number;
  sentido: 1 | -1;
  dibujo: number;
  opacidad: number;
  desplazamiento: number;
}> = ({ y, sentido, dibujo, opacidad, desplazamiento }) => {
  const largo = 52;
  const x0 = -(largo / 2) * sentido;
  const x1 = (largo / 2) * sentido;
  const punta = interpolate(dibujo, [0.7, 1], [0, 1], { ...clamp, easing: easeOut });
  return (
    <g transform={`translate(${desplazamiento * sentido} ${y})`} opacity={opacidad}>
      <path
        d={`M ${x0} 0 L ${x1} 0`}
        stroke={COLORES.texto}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={largo}
        strokeDashoffset={largo * (1 - dibujo)}
      />
      <path
        d={`M ${x1 - 9 * sentido} -8 L ${x1} 0 L ${x1 - 9 * sentido} 8`}
        fill="none"
        stroke={COLORES.texto}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${x1} 0) scale(${punta}) translate(${-x1} 0)`}
      />
    </g>
  );
};

const Sucursales: React.FC = () => {
  const { t, frame, fps } = useSegundos();
  const { inicio, fin } = T.sucursales;

  // Pastilla: aparece con un spring suave.
  const pastilla = spring({
    frame: frame - Math.round(inicio * fps),
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  // Íconos: entran desde los costados y se encuentran en la pastilla.
  const llegada = interpolate(t, [inicio + 0.05, inicio + 0.7], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const recorrido = (1 - llegada) * M.recorridoSucursal;
  const opacidadIcono = interpolate(llegada, [0, 0.4], [0, 1], clamp);

  // ⇄: se dibujan al final del tramo, una detrás de la otra.
  const dibujoArriba = interpolate(t, [fin - 0.45, fin - 0.1], [0, 1], { ...clamp, easing: easeInOut });
  const dibujoAbajo = interpolate(t, [fin - 0.35, fin], [0, 1], { ...clamp, easing: easeInOut });

  // Loop: las flechas se alternan (una se destaca y avanza mientras la otra se atenúa).
  const entradaLoop = interpolate(t, [fin, fin + 0.5], [0, 1], { ...clamp, easing: easeOut });
  const onda = Math.sin(((t - fin) / M.flechasPeriodo) * Math.PI * 2) * entradaLoop;
  const destaque = (s: number) => ({
    opacidad: 1 - 0.45 * entradaLoop * (0.5 - 0.5 * s),
    desplazamiento: 4 * Math.max(0, s),
  });
  const arriba = destaque(onda);
  const abajo = destaque(-onda);

  const ancho = 300;
  const alto = 104;
  const separacion = 92; // distancia del centro a cada ícono

  return (
    <div
      style={{
        position: "absolute",
        left: 960 - ancho / 2,
        top: 314,
        width: ancho,
        height: alto,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: alto / 2,
          background: COLORES.acento,
          opacity: Math.min(1, pastilla * 1.5),
          transform: `scale(${0.6 + 0.4 * pastilla})`,
        }}
      />
      {[-1, 1].map((lado) => (
        <div
          key={lado}
          style={{
            position: "absolute",
            left: ancho / 2 + lado * separacion - 32,
            top: alto / 2 - 34,
            opacity: opacidadIcono,
            transform: `translateX(${lado * recorrido}px)`,
          }}
        >
          <IconoSucursal />
        </div>
      ))}
      <svg
        width={ancho}
        height={alto}
        viewBox={`${-ancho / 2} ${-alto / 2} ${ancho} ${alto}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <FlechaHorizontal y={-11} sentido={1} dibujo={dibujoArriba} {...arriba} />
        <FlechaHorizontal y={11} sentido={-1} dibujo={dibujoAbajo} {...abajo} />
      </svg>
    </div>
  );
};

export const Placa2: React.FC = () => (
  <Placa salida={T.salida}>
    <Decoracion
      flechas={{
        empuje: { ...T.empujeFlechas, grados: M.empujeGrados },
        balanceoDesde: T.empujeFlechas.fin,
      }}
    />
    <Sucursales />
    <BloqueTexto>
      <Titulo texto={PLACA2.titulo} inicio={T.titulo.inicio} />
      <Subtitulo
        texto={PLACA2.subtitulo}
        inicio={T.subtitulo.inicio}
        anchoMaximo={960}
        resaltar={PLACA2.resaltar}
        pop={{ palabra: PLACA2.pop, escala: M.escalaPop }}
      />
    </BloqueTexto>
  </Placa>
);
