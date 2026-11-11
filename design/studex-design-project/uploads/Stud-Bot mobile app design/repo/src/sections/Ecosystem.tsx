import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ecosystemConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

function FlowArrow({ label, flip }: { label?: string; flip?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '26px 0' }}>
      {label && (
        <p
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,42,26,0.75)',
            marginBottom: 10,
          }}
        >
          {label}
        </p>
      )}
      <svg width="20" height="34" viewBox="0 0 20 34" style={{ display: 'inline-block', transform: flip ? 'rotate(180deg)' : 'none' }}>
        <line x1="10" y1="0" x2="10" y2="24" stroke="#ff2a1a" strokeWidth="1.5" />
        <polygon points="4,22 16,22 10,34" fill="#ff2a1a" />
      </svg>
    </div>
  );
}

export default function Ecosystem() {
  const wrapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.eco-node',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: wrapRef.current, start: 'top 70%' },
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const { nodes, flowLabels, backbone } = ecosystemConfig;

  return (
    <section
      id="ecosystem"
      ref={wrapRef}
      style={{
        background: '#070707',
        padding: '150px 5vw',
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid rgba(255,42,26,0.12)',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 12,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#ff2a1a',
            marginBottom: 28,
          }}
        >
          {ecosystemConfig.sectionLabel}
        </p>
        <h2
          style={{
            fontFamily: "'EB Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(36px, 4.5vw, 68px)',
            lineHeight: 1.1,
            color: '#ffffff',
            maxWidth: 860,
            marginBottom: 26,
          }}
        >
          {ecosystemConfig.heading}
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            fontWeight: 300,
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 760,
            marginBottom: 80,
          }}
        >
          {ecosystemConfig.intro}
        </p>

        {/* The flywheel */}
        {nodes.map((node, i) => (
          <div key={node.title}>
            {i > 0 && (
              <FlowArrow
                label={i <= 2 ? flowLabels[i - 1] : undefined}
                flip={i === nodes.length - 1}
              />
            )}
            {i === nodes.length - 1 && (
              <p
                style={{
                  textAlign: 'center',
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,42,26,0.75)',
                  margin: '-8px 0 10px',
                }}
              >
                {flowLabels[2]}
              </p>
            )}
            <div
              className="eco-node"
              style={{
                border: `1px solid ${i === 2 ? 'rgba(255,42,26,0.55)' : 'rgba(255,255,255,0.12)'}`,
                background: i === 2 ? 'rgba(255,42,26,0.05)' : 'rgba(255,255,255,0.02)',
                padding: 'clamp(32px, 4vw, 52px)',
                boxShadow: i === 2 ? '0 0 60px rgba(255,42,26,0.08)' : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 10,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: i === 2 ? '#ff2a1a' : 'rgba(255,255,255,0.35)',
                  marginBottom: 14,
                }}
              >
                {node.kicker}
              </p>
              <h3
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(26px, 3vw, 40px)',
                  fontWeight: 500,
                  color: '#ffffff',
                  marginBottom: 16,
                }}
              >
                {node.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.55)',
                  maxWidth: 760,
                  marginBottom: 26,
                }}
              >
                {node.body}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {node.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '7px 14px',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <p
          style={{
            textAlign: 'center',
            fontFamily: "'EB Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 2vw, 24px)',
            color: 'rgba(255,255,255,0.65)',
            margin: '60px auto 0',
            maxWidth: 640,
            lineHeight: 1.6,
          }}
        >
          {ecosystemConfig.loopLabel}
        </p>

        {/* The backbone */}
        <div style={{ marginTop: 120 }}>
          <p
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 11,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 40,
              textAlign: 'center',
            }}
          >
            StudEx Technology Backbone
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {backbone.map((b) => (
              <div key={b.title} style={{ background: '#0a0a0a', padding: '28px 22px' }}>
                <h4
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: 19,
                    fontWeight: 500,
                    color: '#ffffff',
                    marginBottom: 10,
                  }}
                >
                  {b.title}
                </h4>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontFamily: "'EB Garamond', serif",
            fontSize: 'clamp(24px, 3vw, 38px)',
            color: '#ffffff',
            marginTop: 100,
            lineHeight: 1.4,
          }}
        >
          {ecosystemConfig.closing.split('StudBot')[0]}
          <span style={{ color: '#ff2a1a' }}>StudBot</span>
          {ecosystemConfig.closing.split('StudBot')[1]}
        </p>
      </div>
    </section>
  );
}
