import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { problemConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemStrip() {
  const wrapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.problem-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: wrapRef.current, start: 'top 75%' },
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  if (!problemConfig.heading) return null;

  return (
    <section
      id="problem"
      ref={wrapRef}
      style={{
        background: '#0a0a0a',
        padding: '130px 5vw 110px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
          {problemConfig.sectionLabel}
        </p>
        <h2
          style={{
            fontFamily: "'EB Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(34px, 4.2vw, 64px)',
            lineHeight: 1.15,
            color: '#ffffff',
            maxWidth: 900,
            marginBottom: 70,
          }}
        >
          {problemConfig.heading}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 1,
            background: 'rgba(255,42,26,0.18)',
            border: '1px solid rgba(255,42,26,0.18)',
          }}
        >
          {problemConfig.cards.map((card) => (
            <div
              key={card.title}
              className="problem-card"
              style={{
                background: '#0d0d0d',
                padding: '44px 36px',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: '#ff2a1a',
                  marginBottom: 26,
                  boxShadow: '0 0 12px rgba(255,42,26,0.8)',
                }}
              />
              <h3
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 24,
                  fontWeight: 500,
                  color: '#ffffff',
                  marginBottom: 14,
                  lineHeight: 1.25,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  fontWeight: 300,
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
