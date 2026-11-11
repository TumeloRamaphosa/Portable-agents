import { useEffect, useState } from 'react';
import { liveTickerConfig } from '../config';

export const TICKER_HEIGHT = 72; // 38px terminal bar + 34px counter banner

export default function LiveTicker() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'clearing'>('typing');

  const lines = liveTickerConfig.lines;
  const current = lines[lineIndex % lines.length];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (charCount < current.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), 26);
      } else {
        timer = setTimeout(() => setPhase('holding'), 0);
      }
    } else if (phase === 'holding') {
      timer = setTimeout(() => setPhase('clearing'), 1800);
    } else {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount((c) => Math.max(0, c - 4)), 12);
      } else {
        setLineIndex((i) => (i + 1) % lines.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [phase, charCount, current, lines.length]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60]"
      style={{ fontFamily: "'Fira Code', monospace" }}
    >
      {/* Terminal bar */}
      <div
        className="flex items-center"
        style={{
          height: 38,
          background: '#050505',
          borderBottom: '1px solid rgba(255,42,26,0.18)',
          padding: '0 5vw',
          fontSize: 12,
          color: 'rgba(255,238,232,0.85)',
          letterSpacing: '0.2px',
        }}
      >
        <span style={{ color: '#ff2a1a', marginRight: 10 }}>&gt;</span>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {current.slice(0, charCount)}
        </span>
        <span
          className="ticker-caret"
          style={{
            display: 'inline-block',
            width: 7,
            height: 14,
            marginLeft: 4,
            background: '#ff2a1a',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Counter banner */}
      <div
        className="flex items-center justify-center"
        style={{
          height: 34,
          background: '#ff2a1a',
          color: '#0a0a0a',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          padding: '0 4vw',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span
          className="ticker-pulse"
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#0a0a0a',
            marginRight: 10,
            flexShrink: 0,
          }}
        />
        {liveTickerConfig.counterText}
      </div>
    </div>
  );
}
