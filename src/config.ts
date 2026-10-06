// ─────────────────────────────────────────────────────────────
//  Configuración editable de las placas.
//  Todos los tiempos están en SEGUNDOS.
// ─────────────────────────────────────────────────────────────

export const FPS = 30;

export const COLORES = {
  fondo: "#0A32A0",
  acento: "#5082F0", // puntos, flechas, círculo del play y pastilla
  resaltado: "#6EA0FA",
  texto: "#FFFFFF",
};

// Ritmo del texto y movimientos compartidos por todas las placas.
export const TEXTO = {
  entrePalabras: 0.08, // 80 ms entre palabras
  duracionPalabra: 0.4, // cuánto tarda cada palabra en subir + fade
  subidaPalabra: 12, // px que sube cada palabra al entrar
};

export const MOVIMIENTO = {
  subidaSalida: 20, // px que sube todo en la salida
  balanceoGrados: 4, // amplitud del balanceo de las flechas
  balanceoPeriodo: 1.6, // segundos por ciclo de balanceo
};

export type Tramo = { inicio: number; fin: number };

// ─────────────────────────── Placa 1 ───────────────────────────

export const PLACA = {
  duracion: 4,

  titulo: "En este video",
  subtitulo: "vamos a ver cómo usar el comparativo de surtido entre sucursales.",
  // Fragmento del subtítulo que se resalta y subraya (debe estar tal cual en el subtítulo).
  resaltar: "comparativo de surtido",

  tiempos: {
    // Tramas de puntos: aparecen en diagonal entre inicio y fin.
    tramas: { inicio: 0.0, fin: 0.6 },
    // Flechas: se dibujan y la punta rebota al final. También entra el play.
    flechas: { inicio: 0.4, fin: 1.2 },
    play: { inicio: 0.4, fin: 1.2 },
    // Título palabra por palabra.
    titulo: { inicio: 1.0, fin: 1.8 },
    // Subtítulo palabra por palabra + resaltado y subrayado.
    subtitulo: { inicio: 1.8, fin: 3.6 },
    // Salida: todo sube y se desvanece.
    salida: { inicio: 3.6, fin: 4.0 },
  },
};

// ─────────────────────────── Placa 2 ───────────────────────────

export const PLACA2 = {
  duracion: 5,

  titulo: "Esta herramienta",
  subtitulo:
    "nos permite comparar el surtido de 2 sucursales y detectar qué productos le faltan a una respecto de la otra.",
  resaltar: "qué productos le faltan",
  // Palabra que hace "pop" (escala 130% → 100%) al aparecer.
  pop: "2",

  tiempos: {
    // Tramas y flechas ya están en pantalla; las flechas dan un empujón.
    empujeFlechas: { inicio: 0.0, fin: 0.6 },
    // Íconos de sucursal entrando desde los costados hacia la pastilla.
    sucursales: { inicio: 0.4, fin: 1.4 },
    titulo: { inicio: 1.2, fin: 2.0 },
    subtitulo: { inicio: 2.0, fin: 4.6 },
    salida: { inicio: 4.6, fin: 5.0 },
  },

  movimiento: {
    empujeGrados: 10, // cuánto giran las flechas al "empujar"
    escalaPop: 1.3, // escala inicial del "2"
    recorridoSucursal: 420, // px desde donde entra cada ícono
    flechasPeriodo: 1.2, // segundos por ciclo de alternancia de ⇄
  },
};
