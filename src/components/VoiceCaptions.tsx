import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fonts } from '../theme';
import { SceneKey, voice } from '../voice';

// Solo para revisar la sincronización: muestra la frase de la locución y resalta la palabra
// que, según la estimación, se está diciendo.
export const VoiceCaptions: React.FC<{ sceneKey: SceneKey; voiceFrame: number }> = ({ sceneKey, voiceFrame }) => {
  const frame = useCurrentFrame();
  const { words } = voice(sceneKey);
  const t = (frame - voiceFrame) / 30;
  let current = -1;
  words.forEach((w, i) => {
    if (w.s <= t) current = i;
  });
  const from = Math.max(0, current - 5);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 18 }}>
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontFamily: fonts.body,
          fontSize: 30,
          padding: '8px 18px',
          borderRadius: 8,
        }}
      >
        {sceneKey} · {t.toFixed(2)} s ·{' '}
        {words.slice(from, current + 4).map((w, i) => (
          <span key={i} style={{ color: from + i === current ? '#FFE14D' : '#fff', fontWeight: from + i === current ? 700 : 400 }}>
            {w.w}{' '}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
