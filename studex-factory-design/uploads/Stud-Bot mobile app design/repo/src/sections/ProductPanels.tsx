import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { productPanelsConfig } from '../config';

const RED = '#ff2a1a';

export default function ProductPanels() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    const observers: IntersectionObserver[] = [];

    panels.forEach((panel) => {
      gsap.set(panel, { opacity: 0, y: 80 });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(panel, {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: 'power3.out',
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(panel);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (productPanelsConfig.panels.length === 0) return null;

  return (
    <section
      id="stack"
      ref={sectionRef}
      style={{ padding: '150px 5vw 80px', background: 'transparent', position: 'relative' }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
          {productPanelsConfig.sectionLabel}
        </div>
        <div
          className="mb-20"
          style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }}
        />

        <div className="flex flex-col" style={{ gap: 120 }}>
          {productPanelsConfig.panels.map((p, i) => (
            <div
              key={p.slug}
              ref={(el) => { panelRefs.current[i] = el; }}
              onClick={() => navigate(`/capability/${p.slug}`)}
              style={{
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.015)',
                padding: 'clamp(32px, 5vw, 72px)',
                overflow: 'hidden',
              }}
            >
              {/* index chip */}
              <div
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 28,
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 13,
                  color: RED,
                  border: `1px solid ${RED}`,
                  padding: '4px 12px',
                  letterSpacing: '2px',
                  opacity: 0.9,
                }}
              >
                {p.index}
              </div>

              <div className="flex flex-col lg:flex-row" style={{ gap: 'clamp(32px, 4vw, 64px)' }}>
                {/* left rail — features */}
                <div style={{ flex: '0 0 240px' }} className="hidden lg:flex flex-col" >
                  {p.features.map((f, fi) => (
                    <div
                      key={fi}
                      className="flex items-start"
                      style={{
                        gap: 12,
                        padding: '14px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          background: RED,
                          marginTop: 7,
                          flexShrink: 0,
                          boxShadow: `0 0 8px ${RED}`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 300,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: '#dadada',
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* center — name + image */}
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "'Anton', sans-serif",
                      fontSize: 'clamp(56px, 7vw, 120px)',
                      lineHeight: 0.95,
                      letterSpacing: '0.01em',
                      color: '#ffffff',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      textShadow: '0 0 40px rgba(255,42,26,0.15)',
                    }}
                  >
                    {p.name}
                  </h3>
                  <div
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 'clamp(13px, 1.4vw, 17px)',
                      letterSpacing: '4px',
                      color: RED,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    {p.subtitle}
                  </div>
                  <p
                    style={{
                      fontFamily: "'EB Garamond', serif",
                      fontSize: 'clamp(18px, 1.8vw, 24px)',
                      color: '#dadada',
                      margin: '0 0 32px 0',
                      fontStyle: 'italic',
                    }}
                  >
                    {p.tagline}
                  </p>

                  {p.image && (
                    <div
                      className="relative overflow-hidden"
                      style={{
                        aspectRatio: '3/2',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'saturate(0.9)',
                          transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                        }}
                        loading="lazy"
                        onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                        onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* money panel */}
              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{
                  marginTop: 40,
                  border: `1px solid rgba(255, 42, 26, 0.35)`,
                  background: 'rgba(255, 42, 26, 0.04)',
                  padding: 'clamp(24px, 3vw, 40px)',
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 12,
                      letterSpacing: '3px',
                      color: RED,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Why it makes you money
                  </div>
                </div>
                <div className="flex flex-col" style={{ gap: 10 }}>
                  {p.moneyPoints.map((m, mi) => (
                    <div key={mi} className="flex items-start" style={{ gap: 10 }}>
                      <span style={{ color: RED, fontFamily: "'Fira Code', monospace", fontSize: 13 }}>✓</span>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 300,
                          fontSize: 14,
                          color: '#f5f0e8',
                          lineHeight: 1.5,
                        }}
                      >
                        {m}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* badge strip */}
              <div
                className="flex flex-wrap"
                style={{
                  marginTop: 28,
                  gap: 0,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {p.badges.map((b, bi) => (
                  <div
                    key={bi}
                    style={{
                      flex: '1 1 auto',
                      textAlign: 'center',
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 11,
                      letterSpacing: '2px',
                      color: '#dadada',
                      opacity: 0.7,
                      padding: '14px 8px 0',
                      textTransform: 'uppercase',
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
