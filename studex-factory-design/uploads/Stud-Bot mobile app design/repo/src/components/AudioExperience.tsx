import { useEffect, useRef, useState } from 'react';

const RED = '#ff2a1a';

/**
 * Site-wide classical music layer.
 * Browsers block autoplay-with-sound, so playback starts on the first
 * user gesture (click / keypress / scroll-touch). A small floating
 * toggle sits bottom-right on every page.
 */
export default function AudioExperience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/audio/orchestra-theme.mp3');
    audio.loop = true;
    audio.volume = 0.32;
    audioRef.current = audio;

    const start = () => {
      if (started) return;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setStarted(true);
        })
        .catch(() => {});
    };

    // begin on first gesture anywhere
    window.addEventListener('click', start, { once: false });
    window.addEventListener('keydown', start, { once: false });
    window.addEventListener('touchstart', start, { once: false });

    return () => {
      window.removeEventListener('click', start);
      window.removeEventListener('keydown', start);
      window.removeEventListener('touchstart', start);
      audio.pause();
      audioRef.current = null;
    };
  }, [started]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Mute orchestra' : 'Play orchestra'}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(10,10,10,0.75)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${playing ? RED : 'rgba(255,255,255,0.2)'}`,
        color: playing ? RED : '#dadada',
        padding: '8px 14px',
        cursor: 'pointer',
        fontFamily: "'Fira Code', monospace",
        fontSize: 11,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        boxShadow: playing ? `0 0 18px rgba(255,42,26,0.25)` : 'none',
      }}
    >
      {/* equalizer bars */}
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 2,
              background: 'currentColor',
              height: playing ? undefined : 4,
              animation: playing ? `eq 0.9s ease-in-out ${i * 0.18}s infinite alternate` : 'none',
              display: 'inline-block',
              minHeight: 3,
            }}
          />
        ))}
      </span>
      {playing ? 'Orchestra' : 'Sound'}
      <style>{`@keyframes eq { from { height: 3px; } to { height: 12px; } }`}</style>
    </button>
  );
}
