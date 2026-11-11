import { useEffect, useRef, useState } from 'react';
import { standingArmyConfig } from '../config';

export default function StandingArmy() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="standing-army"
      ref={ref}
      style={{
        background: '#0a0a0a',
        padding: 'clamp(90px, 12vw, 160px) 5vw',
        borderTop: '1px solid rgba(255,42,26,0.14)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 12,
            letterSpacing: 4,
            color: '#ff2a1a',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          {standingArmyConfig.sectionLabel}
        </p>

        <h2
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(56px, 9vw, 150px)',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: '#ffffff',
            letterSpacing: '0.01em',
            textShadow: '0 0 42px rgba(255,42,26,0.35)',
            margin: '0 0 48px 0',
          }}
        >
          {standingArmyConfig.heading}
        </h2>

        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          {standingArmyConfig.lines.map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'EB Garamond', serif",
                fontStyle: i === standingArmyConfig.lines.length - 1 ? 'italic' : 'normal',
                fontSize: 'clamp(20px, 2.2vw, 30px)',
                lineHeight: 1.5,
                color: i === standingArmyConfig.lines.length - 1 ? '#ff2a1a' : '#dadada',
                margin: '0 0 14px 0',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div
          style={{
            border: '1px solid rgba(255,42,26,0.35)',
            padding: 10,
            background: 'rgba(255,42,26,0.03)',
          }}
        >
          <img
            src={standingArmyConfig.image}
            alt="Your first employee never sleeps"
            style={{
              width: '100%',
              aspectRatio: '3 / 2',
              objectFit: 'cover',
              display: 'block',
              filter: 'contrast(1.05)',
            }}
          />
          <p
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 11,
              letterSpacing: 2,
              color: 'rgba(255,238,232,0.45)',
              margin: '12px 4px 2px',
              textTransform: 'uppercase',
            }}
          >
            {standingArmyConfig.caption}
          </p>
        </div>
      </div>
    </section>
  );
}
