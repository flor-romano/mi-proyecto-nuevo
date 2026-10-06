// ─────────────────────────────────────────────────────────────
//  Configuración editable de la placa.
//  Todos los tiempos están en SEGUNDOS.
// ─────────────────────────────────────────────────────────────

export const FPS = 30;

export const COLORES = {
  fondo: "#0A32A0",
  acento: "#5082F0", // puntos, flechas y círculo del play
  resaltado: "#6EA0FA",
  texto: "#FFFFFF",
};

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

    entrePalabras: 0.08, // 80 ms entre palabras
    duracionPalabra: 0.4, // cuánto tarda cada palabra en subir + fade
  },

  movimiento: {
    subidaPalabra: 12, // px que sube cada palabra al entrar
    subidaSalida: 20, // px que sube todo en la salida
    balanceoGrados: 4, // amplitud del balanceo de las flechas
    balanceoPeriodo: 1.6, // segundos por ciclo de balanceo
  },
};
