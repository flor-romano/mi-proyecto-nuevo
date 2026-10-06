import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { WordReveal } from '../components/WordReveal';
import { IconCircle } from '../components/IconCircle';
import {
  AntAlertIcon,
  BoxesIcon,
  CrossContaminationIcon,
  DropSparkleIcon,
  FactoryIcon,
  HandsIcon,
  SnowflakeIcon,
  StoreIcon,
  TruckIcon,
} from '../components/Icons';
import { colors, type } from '../theme';
import { voice } from '../voice';
import { useAt } from './timing';

const v = voice('escena-7');
const higienizar = v.w('higienizarnos');
const plagas = v.w('plagas');
export const CUES = {
  // "La contaminación puede ocurrir en la producción, el traslado, el almacenamiento y la exhibición..."
  stages: [v.w('producción'), v.w('traslado'), v.w('almacenamiento'), v.w('exhibición')],
  // "...y llega a ellos por cuatro vías."
  tabsIn: v.w('cuatro'),
  // Cada pestaña se activa cuando empieza su vía.
  personas: v.after('las', v.w('cuatro')), // "Las personas"
  medio: v.after('el', v.w('personas')), // "El medio ambiente"
  plagas: v.after('las', v.w('reproduzcan')), // "Las plagas"
  cruzada: v.after('y', v.w('sucursal')), // "Y la contaminación cruzada"
  // Contenido de cada pestaña.
  manos: [
    higienizar, v.after('las', higienizar), v.w('manos'), v.w('cada'), v.w('vez'), v.after('que', higienizar),
    v.w('estamos'), v.after('en', higienizar), v.w('contacto'), v.after('con', higienizar), v.after('alimentos', higienizar),
  ],
  limpieza: v.w('limpiamos'),
  frio: v.w('controlamos'),
  plagasTexto: v.after('si', plagas),
  avisa: v.w('avisá'),
  directa: v.w('directa'),
  indirecta: v.w('indirecta'),
};
const TABS_ACTIVE = [CUES.personas, CUES.medio, CUES.plagas, CUES.cruzada];
export const POPS = [...CUES.stages, ...TABS_ACTIVE, CUES.limpieza, CUES.frio, CUES.directa, CUES.indirecta];

const PANEL = { x: 210, y: 330, w: 1500, h: 640 };
const TAB_H = 110;
const TABS = ['Personas', 'Medio ambiente', 'Plagas', 'Contaminación cruzada'];
const STAGE_ICONS = [FactoryIcon, TruckIcon, BoxesIcon, StoreIcon];

export const Scene7Vias: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = useAt();

  const stagesOut = spring({ frame: frame - at(CUES.tabsIn) + 6, fps, config: { damping: 200 }, durationInFrames: 14 });
  const tabsIn = spring({ frame: frame - at(CUES.tabsIn) - 4, fps, config: { damping: 200 }, durationInFrames: 20 });
  // Índice de la pestaña activa (-1 antes de la primera).
  const active = TABS_ACTIVE.reduce((acc, t, i) => (frame >= at(t) ? i : acc), -1);

  return (
    <AbsoluteFill>
      {/* El título ya está en pantalla mientras la escena entra deslizándose. */}
      <div style={{ position: 'absolute', top: 100, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Pill delay={-30} style={{ transformOrigin: 'center' }}>
          ¿Cómo se contaminan los alimentos?
        </Pill>
      </div>

      {/* Etapas: producción, traslado, almacenamiento y exhibición */}
      {stagesOut < 0.999 && (
        <div style={{ opacity: 1 - stagesOut, transform: `scale(${1 - 0.1 * stagesOut})`, transformOrigin: '50% 560px' }}>
          <svg width={1920} height={1080} style={{ position: 'absolute' }}>
            {CUES.stages.slice(1).map((t, i) => {
              const p = interpolate(frame, [at(t) - 8, at(t)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const x1 = 480 + i * 320 + 110;
              return (
                <line key={i} x1={x1} y1={560} x2={x1 + (320 - 220) * p} y2={560} stroke={colors.pill} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />
              );
            })}
          </svg>
          {STAGE_ICONS.map((Icon, i) => (
            <div key={i} style={{ position: 'absolute', left: 480 + i * 320 - 100, top: 460 }}>
              <IconCircle size={200} delay={at(CUES.stages[i])}>
                <Icon size={120} />
              </IconCircle>
            </div>
          ))}
        </div>
      )}

      {/* Pestañas y panel */}
      {tabsIn > 0.001 && (
        <div style={{ opacity: tabsIn, transform: `translateY(${(1 - tabsIn) * 60}px)` }}>
          {TABS.map((label, i) => {
            const on = spring({ frame: frame - at(TABS_ACTIVE[i]), fps, config: { damping: 200 }, durationInFrames: 10 });
            const off = i < TABS.length - 1 ? spring({ frame: frame - at(TABS_ACTIVE[i + 1]), fps, config: { damping: 200 }, durationInFrames: 10 }) : 0;
            const a = on - off;
            return (
              <div
                key={label}
                style={{
                  position: 'absolute',
                  left: PANEL.x + (i * PANEL.w) / 4,
                  top: PANEL.y - TAB_H - 10 * a,
                  width: PANEL.w / 4 - 8,
                  height: TAB_H + 10 * a,
                  boxSizing: 'border-box',
                  padding: '0 20px',
                  borderRadius: '24px 24px 0 0',
                  backgroundColor: interpolateColors(a, [0, 1], [colors.pill, colors.accent]),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: colors.white,
                  ...type.subtitle,
                }}
              >
                {label}
              </div>
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: PANEL.x,
              top: PANEL.y,
              width: PANEL.w - 8,
              height: PANEL.h,
              boxSizing: 'border-box',
              backgroundColor: colors.white,
              border: `3px solid ${colors.sky}`,
              borderTop: `8px solid ${colors.accent}`,
              borderRadius: '0 0 32px 32px',
              boxShadow: '0 16px 36px rgba(0, 150, 210, 0.14)',
              overflow: 'hidden',
            }}
          >
            {[Personas, MedioAmbiente, Plagas, Cruzada].map((Content, i) => {
              if (Math.abs(active - i) > 1) return null;
              const inP = spring({ frame: frame - at(TABS_ACTIVE[i]), fps, config: { damping: 200 }, durationInFrames: 16 });
              const outP = i < 3 ? spring({ frame: frame - at(TABS_ACTIVE[i + 1]), fps, config: { damping: 200 }, durationInFrames: 10 }) : 0;
              const o = inP * (1 - outP);
              if (o <= 0.001) return null;
              return (
                <div key={i} style={{ position: 'absolute', inset: 0, opacity: o, transform: `translateX(${(1 - inP) * 50}px)` }}>
                  <Content at={at} start={at(TABS_ACTIVE[i])} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

type ContentProps = { at: (s: number) => number; start: number };

const Row: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 48, ...style }}>{children}</div>
);

const Personas: React.FC<ContentProps> = ({ at, start }) => (
  <Row style={{ left: 120, top: 0, height: '100%', width: 1240 }}>
    <IconCircle size={260} delay={start}>
      <HandsIcon size={160} />
    </IconCircle>
    <WordReveal
      text="**Higienizá tus manos** cada vez que estés en contacto con alimentos."
      times={CUES.manos.map(at)}
      style={{ ...type.body, color: colors.text, width: 760 }}
      boldStyle={{ color: colors.accent }}
    />
  </Row>
);

const MedioAmbiente: React.FC<ContentProps> = ({ at }) => (
  <>
    {[
      { Icon: DropSparkleIcon, label: 'Limpieza y desinfección', t: CUES.limpieza, top: 90 },
      { Icon: SnowflakeIcon, label: 'Control del frío', t: CUES.frio, top: 350 },
    ].map(({ Icon, label, t, top }) => (
      <Row key={label} style={{ left: 260, top }}>
        <IconCircle size={180} delay={at(t)}>
          <Icon size={112} />
        </IconCircle>
        <WordReveal text={label} delay={at(t) + 4} stagger={4} style={{ ...type.subtitle, color: colors.accent }} />
      </Row>
    ))}
  </>
);

const PLAGAS_TEXT = 'Si ves evidencia de plagas, **avisá a la jefatura de sector o la gerencia.**';
const Plagas: React.FC<ContentProps> = ({ at, start }) => {
  // La primera palabra entra con "si encontrás..."; "avisá..." con "avisá".
  const times: (number | undefined)[] = [];
  times[0] = at(CUES.plagasTexto);
  times[5] = at(CUES.avisa);
  return (
    <Row style={{ left: 120, top: 0, height: '100%', width: 1240 }}>
      <IconCircle size={260} delay={start}>
        <AntAlertIcon size={160} />
      </IconCircle>
      <WordReveal text={PLAGAS_TEXT} times={times} style={{ ...type.body, color: colors.text, width: 760 }} boldStyle={{ color: colors.accent }} />
    </Row>
  );
};

const Cruzada: React.FC<ContentProps> = ({ at, start }) => (
  <Row style={{ left: 120, top: 0, height: '100%', width: 1300 }}>
    <IconCircle size={240} delay={start}>
      <CrossContaminationIcon size={150} />
    </IconCircle>
    <div style={{ display: 'flex', gap: 56 }}>
      {[
        { title: 'Directa', text: 'Alimento contaminado en contacto con alimento seguro.', t: CUES.directa },
        { title: 'Indirecta', text: 'A través de cuchillos, manos o tablas.', t: CUES.indirecta },
      ].map(({ title, text, t }) => (
        <div key={title} style={{ width: 400 }}>
          <WordReveal text={title} delay={at(t)} style={{ ...type.subtitle, color: colors.accent }} />
          <WordReveal text={text} delay={at(t) + 6} stagger={3} style={{ marginTop: 12, ...type.body, color: colors.text }} />
        </div>
      ))}
    </div>
  </Row>
);
