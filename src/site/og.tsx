import { ImageResponse } from 'next/og';
import { content, type Lang, STACK } from '../content';

export const OG_SIZE = { width: 1200, height: 630 };

// The share card: name, role and stack on the figures' paper.
export function ogImage(lang: Lang) {
  const t = content[lang].hero;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 28,
        padding: 80,
        background: '#f2f2ef',
        color: '#18181a',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 34, letterSpacing: 4, color: '#57575a' }}>{t.name.toUpperCase()}</div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 78, lineHeight: 1.05 }}>
        <span>{t.title}</span>
        <span style={{ color: '#57575a', fontSize: 44 }}>{t.area}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {STACK.map((s) => (
          <div
            key={s}
            style={{
              fontSize: 28,
              padding: '6px 18px',
              border: '2px solid #b4b4b8',
              background: '#fbfbfa',
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>,
    OG_SIZE,
  );
}
