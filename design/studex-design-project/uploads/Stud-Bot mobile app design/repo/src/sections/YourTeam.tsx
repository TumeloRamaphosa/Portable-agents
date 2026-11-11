import { useEffect, useRef, useState } from 'react';
import { yourTeamConfig } from '../config';

export default function YourTeam() {
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
      id="your-team"
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
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(40px, 6vw, 90px)',
          alignItems: 'center',
        }}
      >
        <div>
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
            {yourTeamConfig.sectionLabel}
          </p>
          <h2
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: 'clamp(40px, 4.6vw, 64px)',
              lineHeight: 1.05,
              color: '#ffffff',
              margin: '0 0 44px 0',
            }}
          >
            {yourTeamConfig.heading}
          </h2>

          <div>
            {yourTeamConfig.roles.map((role, i) => (
              <div
                key={i}
                className="your-team-role"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                  padding: '13px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-24px)',
                  transition: `opacity 0.6s ease ${0.15 + i * 0.09}s, transform 0.6s ease ${0.15 + i * 0.09}s`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: '#ff2a1a',
                    boxShadow: '0 0 8px #ff2a1a',
                    flexShrink: 0,
                    transform: 'translateY(-2px)',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: 'clamp(19px, 2vw, 26px)',
                    color: '#dadada',
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: '#ffffff', fontWeight: 600 }}>{role.agent}</strong>
                  {' '}{role.action}
                </span>
                <span
                  className="hidden md:inline"
                  style={{
                    marginLeft: 'auto',
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'rgba(255,42,26,0.55)',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  {role.instrument}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: "'EB Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(20px, 2vw, 26px)',
              color: '#ff2a1a',
              marginTop: 36,
            }}
          >
            {yourTeamConfig.closing}
          </p>
        </div>

        <div
          style={{
            border: '1px solid rgba(255,42,26,0.35)',
            padding: 10,
            background: 'rgba(255,42,26,0.03)',
          }}
        >
          <img
            src={yourTeamConfig.image}
            alt="Twelve instruments around the boardroom table"
            style={{
              width: '100%',
              aspectRatio: '3 / 2',
              objectFit: 'cover',
              display: 'block',
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
            {yourTeamConfig.caption}
          </p>
        </div>
      </div>
    </section>
  );
}
