import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SourceSans3";
import { COLORES, MOVIMIENTO, Tramo } from "../config";
import { clamp, easeInOut, easeOut, useSegundos } from "./util";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600"],
  subsets: ["latin", "latin-ext"],
});

// ─────────────────────────── Placa base ───────────────────────────

// Fondo + tipografía + salida (todo sube y se desvanece en `salida`).
export const Placa: React.FC<{ salida: Tramo; children: React.ReactNode }> = ({
  salida,
  children,
}) => {
  const { t } = useSegundos();
  const k = interpolate(t, [salida.inicio, salida.fin], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.fondo, fontFamily }}>
      <AbsoluteFill
        style={{ opacity: 1 - k, transform: `translateY(${-k * MOVIMIENTO.subidaSalida}px)` }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─────────────────────────── Tramas de puntos ───────────────────────────

type Punto = { x: number; y: number };

// Trama superior izquierda: filas escalonadas, el borde derecho baja en diagonal.
const tramaSuperior = (): Punto[] => {
  const puntos: Punto[] = [];
  const paso = 52;
  const finesFila = [656, 683, 656, 630, 604, 578, 558, 532, 506];
  finesFila.forEach((fin, fila) => {
    const desfase = fila % 2 === 0 ? 31 : 5;
    for (let x = desfase; x <= fin; x += paso) {
      puntos.push({ x, y: 44 + fila * paso });
    }
  });
  return puntos;
};

// Trama inferior derecha: el borde izquierdo forma una punta hacia la izquierda.
const tramaInferior = (): Punto[] => {
  const puntos: Punto[] = [];
  const paso = 52;
  const iniciosFila = [1402, 1376, 1350, 1324, 1298, 1324, 1350, 1376];
  iniciosFila.forEach((inicio, fila) => {
    for (let x = inicio; x <= 1900; x += paso) {
      puntos.push({ x, y: 711 + fila * paso });
    }
  });
  return puntos;
};

const PUNTOS_SUP = tramaSuperior();
const PUNTOS_INF = tramaInferior();

// Sin `aparicion`, la trama ya está completa desde el primer frame.
const Trama: React.FC<{ puntos: Punto[]; origen: Punto; aparicion?: Tramo }> = ({
  puntos,
  origen,
  aparicion,
}) => {
  const { t } = useSegundos();
  const distancias = puntos.map((p) => Math.abs(p.x - origen.x) + Math.abs(p.y - origen.y));
  const max = Math.max(...distancias);
  const duracionPunto = 0.2;

  return (
    <>
      {puntos.map((p, i) => {
        let k = 1;
        if (aparicion) {
          const ventana = aparicion.fin - aparicion.inicio - duracionPunto;
          const inicio = aparicion.inicio + (distancias[i] / max) * ventana;
          k = interpolate(t, [inicio, inicio + duracionPunto], [0, 1], {
            ...clamp,
            easing: easeOut,
          });
        }
        return (
          <circle key={i} cx={p.x} cy={p.y} r={2.8 * k} fill={COLORES.acento} opacity={0.55 * k} />
        );
      })}
    </>
  );
};

// ─────────────────────────── Flechas ───────────────────────────

type Curva = [Punto, Punto, Punto, Punto];

const bezier = ([a, b, c, d]: Curva, u: number): Punto => {
  const v = 1 - u;
  return {
    x: v * v * v * a.x + 3 * v * v * u * b.x + 3 * v * u * u * c.x + u * u * u * d.x,
    y: v * v * v * a.y + 3 * v * v * u * b.y + 3 * v * u * u * c.y + u * u * u * d.y,
  };
};

const largoCurva = (c: Curva) => {
  let largo = 0;
  let prev = bezier(c, 0);
  for (let i = 1; i <= 100; i++) {
    const p = bezier(c, i / 100);
    largo += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return largo;
};

export type OpcionesFlechas = {
  // Se dibujan sobre su curva y la punta rebota. Sin `dibujo`, ya están en pantalla.
  dibujo?: Tramo;
  // Giro breve de ida y vuelta, como si empujaran la placa.
  empuje?: Tramo & { grados: number };
  // Desde cuándo arranca el balanceo en loop.
  balanceoDesde: number;
};

const Flecha: React.FC<
  OpcionesFlechas & { id: string; curva: Curva; fase: number }
> = ({ id, curva, fase, dibujo, empuje, balanceoDesde }) => {
  const { t, fps, frame } = useSegundos();
  const [a, b, c, d] = curva;
  const ruta = `M ${a.x} ${a.y} C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`;
  const largo = largoCurva(curva);

  let trazo = 1;
  let punta = 1;
  if (dibujo) {
    const finTrazo = dibujo.fin - 0.25;
    trazo = interpolate(t, [dibujo.inicio, finTrazo], [0, 1], { ...clamp, easing: easeInOut });
    // Punta: aparece con rebote cuando el trazo llega al final.
    punta = spring({
      frame: frame - Math.round((finTrazo - 0.08) * fps),
      fps,
      config: { damping: 9, stiffness: 180, mass: 0.6 },
    });
  }

  // Ángulo de la punta según la tangente final de la curva.
  const angulo = (Math.atan2(d.y - c.y, d.x - c.x) * 180) / Math.PI;
  const brazo = 24;

  // Empujón: gira en sentido antihorario (hacia donde apunta cada punta) y vuelve.
  const giroEmpuje = empuje
    ? -Math.sin(
        interpolate(t, [empuje.inicio, empuje.fin], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) }) *
          Math.PI,
      ) *
      empuje.grados
    : 0;

  // Balanceo en loop, que entra suavemente.
  const entradaBalanceo = interpolate(t, [balanceoDesde, balanceoDesde + 0.6], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const balanceo =
    Math.sin(((t - balanceoDesde) / MOVIMIENTO.balanceoPeriodo) * Math.PI * 2 + fase) *
    MOVIMIENTO.balanceoGrados *
    entradaBalanceo;
  const centro = bezier(curva, 0.5);

  return (
    <g transform={`rotate(${balanceo + giroEmpuje} ${centro.x} ${centro.y})`}>
      <defs>
        <mask id={`mascara-${id}`} maskUnits="userSpaceOnUse">
          <path
            d={ruta}
            fill="none"
            stroke="white"
            strokeWidth={20}
            strokeLinecap="round"
            strokeDasharray={largo}
            strokeDashoffset={largo * (1 - trazo)}
          />
        </mask>
      </defs>
      <path
        d={ruta}
        fill="none"
        stroke={COLORES.acento}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray="13 12"
        mask={`url(#mascara-${id})`}
      />
      <g
        transform={`translate(${d.x} ${d.y}) rotate(${angulo}) scale(${punta})`}
        opacity={Math.min(1, punta * 2)}
      >
        <path
          d={`M ${-brazo * 0.85} ${-brazo * 0.6} L 0 0 L ${-brazo * 0.85} ${brazo * 0.6}`}
          fill="none"
          stroke={COLORES.acento}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
};

// Flecha superior derecha: arco que va de derecha a izquierda y baja hacia abajo-izquierda.
const CURVA_SUP: Curva = [
  { x: 1542, y: 352 },
  { x: 1510, y: 320 },
  { x: 1440, y: 318 },
  { x: 1410, y: 384 },
];

// Flecha inferior izquierda: arco que baja y sube hacia la derecha.
const CURVA_INF: Curva = [
  { x: 392, y: 705 },
  { x: 412, y: 760 },
  { x: 478, y: 776 },
  { x: 525, y: 752 },
];

// ─────────────────────────── Decoración completa ───────────────────────────

export const Decoracion: React.FC<{ tramas?: Tramo; flechas: OpcionesFlechas }> = ({
  tramas,
  flechas,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <Trama puntos={PUNTOS_SUP} origen={{ x: 0, y: 0 }} aparicion={tramas} />
    <Trama puntos={PUNTOS_INF} origen={{ x: 1920, y: 1080 }} aparicion={tramas} />
    <Flecha id="sup" curva={CURVA_SUP} fase={0} {...flechas} />
    <Flecha id="inf" curva={CURVA_INF} fase={Math.PI} {...flechas} />
  </svg>
);
