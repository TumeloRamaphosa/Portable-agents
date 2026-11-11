import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const RED = '#ff2a1a';

export default function AgentLord() {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = [imgWrapRef.current, ...textRefs.current].filter(Boolean) as HTMLDivElement[];
    const observers: IntersectionObserver[] = [];
    els.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 50 });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section
      id="orchestrator"
      style={{ padding: '150px 5vw 100px', background: '#050505', position: 'relative', zIndex: 2 }}
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
          The Orchestrator
        </div>
        <div className="mb-16" style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }} />

        <div className="flex flex-col lg:flex-row" style={{ gap: 'clamp(40px, 5vw, 80px)' }}>
          {/* artwork */}
          <div ref={imgWrapRef} style={{ flex: '1 1 55%', minWidth: 0 }}>
            <div
              style={{
                position: 'relative',
                border: '1px solid rgba(255,42,26,0.25)',
                boxShadow: '0 0 60px rgba(255,42,26,0.12)',
                overflow: 'hidden',
              }}
            >
              <img
                src="/images/agent-lord.jpg"
                alt="The Agent Lord — conducting an orchestra of autonomous agents"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </div>
            <div
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 11,
                letterSpacing: '2px',
                color: '#dadada',
                opacity: 0.5,
                marginTop: 12,
                textTransform: 'uppercase',
              }}
            >
              Fig. 1 — The Agent Lord, conducting eight live terminals
            </div>
          </div>

          {/* story */}
          <div style={{ flex: '1 1 45%', minWidth: 0 }} className="flex flex-col justify-center">
            <h2
              ref={(el) => { textRefs.current[0] = el as HTMLDivElement | null; }}
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 400,
                fontSize: 'clamp(32px, 4vw, 58px)',
                letterSpacing: '0.08em',
                lineHeight: 1.15,
                color: '#ffffff',
                margin: '0 0 28px 0',
                textTransform: 'uppercase',
              }}
            >
              I am the<br />Orchestrator
            </h2>

            <div ref={(el) => { textRefs.current[1] = el as HTMLDivElement | null; }}>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(17px, 1.6vw, 21px)',
                  lineHeight: 1.75,
                  color: '#dadada',
                  margin: '0 0 20px 0',
                }}
              >
                Every instrument you see on this site is a living agent — and each one runs its own
                code in its own terminal. They are not illustrations. They are a working orchestra of
                machines, and I hold the baton.
              </p>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(17px, 1.6vw, 21px)',
                  lineHeight: 1.75,
                  color: '#dadada',
                  margin: '0 0 20px 0',
                }}
              >
                They reach across the fleet — the Mac Mini, the VMs, the edge boxes — over a private
                tailnet, sharing one memory. What one instrument learns, the orchestra remembers.
              </p>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(17px, 1.6vw, 21px)',
                  lineHeight: 1.75,
                  color: '#dadada',
                  margin: '0 0 20px 0',
                }}
              >
                And every client deployment runs on our own operating system — Mission Control:
                the brain dump, the priority matrix, the inbox, the decision queue. Agents execute;
                you approve. Three decisions a day — the orchestra does everything else.
              </p>
            </div>

            <div
              ref={(el) => { textRefs.current[2] = el as HTMLDivElement | null; }}
              className="flex flex-wrap"
              style={{ gap: 10, marginTop: 12 }}
            >
              {['Mission Control OS', 'Higgsfield Motion', 'Remotion Renders', 'DeepSeek Harness', 'Tailnet Fleet', 'One Memory'].map((chip) => (
                <span
                  key={chip}
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 11,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: RED,
                    border: `1px solid rgba(255,42,26,0.4)`,
                    padding: '6px 12px',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
