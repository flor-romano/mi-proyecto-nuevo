import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SourceSans3";
import { COLORES, PLACA } from "./config";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600"],
  subsets: ["latin", "latin-ext"],
});

const T = PLACA.tiempos;
const M = PLACA.movimiento;
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Hook de tiempo en segundos.
const useSegundos = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, frame, fps };
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

const Trama: React.FC<{ puntos: Punto[]; origen: Punto }> = ({ puntos, origen }) => {
  const { t } = useSegundos();
  const distancias = puntos.map(
    (p) => Math.abs(p.x - origen.x) + Math.abs(p.y - origen.y),
  );
  const max = Math.max(...distancias);
  const duracionPunto = 0.2;
  const ventana = T.tramas.fin - T.tramas.inicio - duracionPunto;

  return (
    <>
      {puntos.map((p, i) => {
        const inicio = T.tramas.inicio + (distancias[i] / max) * ventana;
        const k = interpolate(t, [inicio, inicio + duracionPunto], [0, 1], {
          ...clamp,
          easing: easeOut,
        });
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.8 * k}
            fill={COLORES.acento}
            opacity={0.55 * k}
          />
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

const Flecha: React.FC<{ id: string; curva: Curva; fase: number }> = ({
  id,
  curva,
  fase,
}) => {
  const { t, fps, frame } = useSegundos();
  const [a, b, c, d] = curva;
  const ruta = `M ${a.x} ${a.y} C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`;
  const largo = largoCurva(curva);

  const finTrazo = T.flechas.fin - 0.25;
  const trazo = interpolate(t, [T.flechas.inicio, finTrazo], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Punta: aparece con rebote cuando el trazo llega al final.
  const punta = spring({
    frame: frame - Math.round((finTrazo - 0.08) * fps),
    fps,
    config: { damping: 9, stiffness: 180, mass: 0.6 },
  });

  // Ángulo de la punta según la tangente final de la curva.
  const angulo = (Math.atan2(d.y - c.y, d.x - c.x) * 180) / Math.PI;
  const brazo = 24;

  // Balanceo en loop, que entra suavemente al terminar el dibujo.
  const entradaBalanceo = interpolate(t, [T.flechas.fin, T.flechas.fin + 0.6], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const balanceo =
    Math.sin(((t - T.flechas.fin) / M.balanceoPeriodo) * Math.PI * 2 + fase) *
    M.balanceoGrados *
    entradaBalanceo;
  const centro = bezier(curva, 0.5);

  return (
    <g transform={`rotate(${balanceo} ${centro.x} ${centro.y})`}>
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

// ─────────────────────────── Ícono de play ───────────────────────────

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

// ─────────────────────────── Texto ───────────────────────────

const Palabra: React.FC<{ inicio: number; children: React.ReactNode; color?: string }> = ({
  inicio,
  children,
  color,
}) => {
  const { t } = useSegundos();
  const k = interpolate(t, [inicio, inicio + T.duracionPalabra], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  return (
    <span
      style={{
        display: "inline-block",
        opacity: k,
        transform: `translateY(${(1 - k) * M.subidaPalabra}px)`,
        color,
      }}
    >
      {children}
    </span>
  );
};

const Titulo: React.FC = () => {
  const palabras = PLACA.titulo.split(" ");
  return (
    <div style={{ fontWeight: 600, fontSize: 51, lineHeight: 1.2 }}>
      {palabras.map((p, i) => (
        <React.Fragment key={i}>
          <Palabra inicio={T.titulo.inicio + i * T.entrePalabras}>{p}</Palabra>
          {i < palabras.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </div>
  );
};

const Subtitulo: React.FC = () => {
  const { t } = useSegundos();
  const texto = PLACA.subtitulo;
  const idx = texto.indexOf(PLACA.resaltar);
  const antes = idx >= 0 ? texto.slice(0, idx).trim() : texto;
  const destacado = idx >= 0 ? PLACA.resaltar : "";
  const despues = idx >= 0 ? texto.slice(idx + destacado.length).trim() : "";

  const pAntes = antes ? antes.split(" ") : [];
  const pDest = destacado ? destacado.split(" ") : [];
  const pDespues = despues ? despues.split(" ") : [];
  const inicioPalabra = (i: number) => T.subtitulo.inicio + i * T.entrePalabras;

  // Resaltado y subrayado: empiezan cuando terminó de entrar la frase destacada.
  const finDest = inicioPalabra(pAntes.length + pDest.length - 1) + T.duracionPalabra;
  const cambioColor = interpolate(t, [finDest, finDest + 0.35], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const subrayado = interpolate(t, [finDest + 0.1, finDest + 0.7], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const color = mezclar(COLORES.texto, COLORES.resaltado, cambioColor);

  const renderLista = (lista: string[], desde: number, colorPalabra?: string) =>
    lista.map((p, i) => (
      <React.Fragment key={desde + i}>
        <Palabra inicio={inicioPalabra(desde + i)} color={colorPalabra}>
          {p}
        </Palabra>
        {i < lista.length - 1 ? " " : null}
      </React.Fragment>
    ));

  return (
    <div style={{ fontWeight: 400, fontSize: 36, lineHeight: "42px", maxWidth: 800 }}>
      {renderLista(pAntes, 0)}
      {pDest.length > 0 ? (
        <>
          {pAntes.length > 0 ? " " : null}
          <span style={{ position: "relative", whiteSpace: "nowrap" }}>
            {renderLista(pDest, pAntes.length, color)}
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: -1,
                height: 3,
                borderRadius: 2,
                width: `${subrayado * 100}%`,
                background: COLORES.resaltado,
              }}
            />
          </span>
          {pDespues.length > 0 ? " " : null}
        </>
      ) : null}
      {renderLista(pDespues, pAntes.length + pDest.length)}
    </div>
  );
};

const mezclar = (a: string, b: string, k: number) => {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return `rgb(${c.join(",")})`;
};

// ─────────────────────────── Composición ───────────────────────────

export const PlacaIntro: React.FC = () => {
  const { t } = useSegundos();
  const salida = interpolate(t, [T.salida.inicio, T.salida.fin], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORES.fondo, fontFamily }}>
      <AbsoluteFill
        style={{
          opacity: 1 - salida,
          transform: `translateY(${-salida * M.subidaSalida}px)`,
        }}
      >
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <Trama puntos={PUNTOS_SUP} origen={{ x: 0, y: 0 }} />
          <Trama puntos={PUNTOS_INF} origen={{ x: 1920, y: 1080 }} />
          <Flecha id="sup" curva={CURVA_SUP} fase={0} />
          <Flecha id="inf" curva={CURVA_INF} fase={Math.PI} />
        </svg>

        <Play />

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
          <Titulo />
          <Subtitulo />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
