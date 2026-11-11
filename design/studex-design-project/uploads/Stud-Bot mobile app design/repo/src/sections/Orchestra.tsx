import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { orchestraConfig } from '../config';

const RED = '#ff2a1a';
const GOLD = '#C9A962';

export default function Orchestra() {
  const tierRefs = useRef<(HTMLDivElement | null)[]>([]);
  const movementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  useEffect(() => {
    const els = [...tierRefs.current, ...movementRefs.current].filter(Boolean) as HTMLDivElement[];
    const observers: IntersectionObserver[] = [];
    els.forEach((el, idx) => {
      gsap.set(el, { opacity: 0, y: 40 });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(el, { opacity: 1, y: 0, duration: 0.9, delay: (idx % 5) * 0.1, ease: 'power3.out' });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const cfg = orchestraConfig;

  return (
    <section id="orchestra" style={{ padding: '150px 5vw', background: '#0a0a0a', position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* section label */}
        <div
          className="mb-6"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#dadada',
            opacity: 0.6,
          }}
        >
          {cfg.sectionLabel}
        </div>
        <div className="mb-16" style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }} />

        {/* heading */}
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 400,
            fontSize: 'clamp(36px, 5vw, 72px)',
            letterSpacing: '0.12em',
            color: '#ffffff',
            margin: '0 0 24px 0',
            textTransform: 'uppercase',
          }}
        >
          {cfg.heading}
        </h2>
        <p
          style={{
            fontFamily: "'EB Garamond', serif",
            fontSize: 'clamp(18px, 2vw, 26px)',
            fontStyle: 'italic',
            color: '#dadada',
            maxWidth: 820,
            lineHeight: 1.6,
            margin: '0 0 80px 0',
          }}
        >
          {cfg.intro}
        </p>

        {/* commission tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 2, marginBottom: 100 }}>
          {cfg.tiers.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => { tierRefs.current[i] = el; }}
              onMouseEnter={() => setHoveredTier(i)}
              onMouseLeave={() => setHoveredTier(null)}
              style={{
                border: `1px solid ${t.featured || hoveredTier === i ? 'rgba(201,169,98,0.6)' : 'rgba(255,255,255,0.08)'}`,
                background: t.featured
                  ? 'linear-gradient(160deg, rgba(201,169,98,0.08) 0%, rgba(10,10,10,0) 60%)'
                  : hoveredTier === i
                    ? 'rgba(201,169,98,0.04)'
                    : 'rgba(255,255,255,0.015)',
                padding: 'clamp(28px, 3vw, 44px)',
                cursor: 'pointer',
                transition: 'border-color 0.4s ease, background 0.4s ease',
                position: 'relative',
              }}
            >
              {t.featured && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 10,
                    letterSpacing: '2px',
                    color: GOLD,
                    border: `1px solid ${GOLD}`,
                    padding: '3px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  Flagship
                </div>
              )}
              <div
                style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 11,
                  letterSpacing: '3px',
                  color: GOLD,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                {t.ensemble}
              </div>
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 400,
                  fontSize: 'clamp(24px, 2.4vw, 34px)',
                  letterSpacing: '0.06em',
                  color: '#ffffff',
                  margin: '0 0 8px 0',
                }}
              >
                {t.name}
              </h3>
              <div
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  color: GOLD,
                  margin: '0 0 12px 0',
                }}
              >
                {t.price}
              </div>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 17,
                  color: '#dadada',
                  margin: '0 0 24px 0',
                  lineHeight: 1.5,
                }}
              >
                {t.tagline}
              </p>
              <div className="flex flex-col" style={{ gap: 8 }}>
                {t.includes.map((inc, ii) => (
                  <div key={ii} className="flex items-start" style={{ gap: 10 }}>
                    <span style={{ color: GOLD, fontSize: 12, marginTop: 4 }}>♪</span>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        fontSize: 13,
                        color: '#dadada',
                        lineHeight: 1.5,
                      }}
                    >
                      {inc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* entry note cell */}
          <div
            style={{
              border: `1px dashed rgba(255,42,26,0.4)`,
              padding: 'clamp(28px, 3vw, 44px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 11,
                letterSpacing: '3px',
                color: RED,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              The doorway
            </div>
            <p
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: 19,
                color: '#f5f0e8',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Every commission begins as a <em>Super Agents subscription</em> — from R1,599/month.
              The atelier listens first. Then we compose.
            </p>
          </div>
        </div>

        {/* six movements */}
        <div
          className="mb-10"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#dadada',
            opacity: 0.6,
          }}
        >
          The Engagement — Six Movements
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 0 }}>
          {cfg.movements.map((m, i) => (
            <div
              key={m.numeral}
              ref={(el) => { movementRefs.current[i] = el; }}
              style={{
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                padding: '20px 18px 28px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 28,
                  color: GOLD,
                  marginBottom: 10,
                }}
              >
                {m.numeral}
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 14,
                  letterSpacing: '0.08em',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {m.name}
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 200,
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: '#dadada',
                  opacity: 0.75,
                  margin: 0,
                }}
              >
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
