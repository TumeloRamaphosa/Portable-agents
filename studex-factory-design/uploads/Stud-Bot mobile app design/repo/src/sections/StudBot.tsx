import { useEffect, useRef, useState } from 'react';
import { studbotConfig } from '../config';
import { necro } from '../tokens';

const MONO = necro.mono;

export default function StudBot() {
  const ref = useRef<HTMLElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [current, setCurrent] = useState('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Type the boot log once the terminal scrolls into view
  useEffect(() => {
    const el = termRef.current;
    if (!el) return;
    let started = false;
    let li = 0;
    let ci = 0;
    let timer: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        const tick = () => {
          const boot = studbotConfig.bootLines;
          if (li >= boot.length) return;
          const line = boot[li];
          if (ci <= line.length) {
            setCurrent(line.slice(0, ci));
            ci += 1;
            timer = setTimeout(tick, line.startsWith('✓') ? 12 : 26);
          } else {
            setLines((prev) => [...prev, line]);
            setCurrent('');
            li += 1;
            ci = 0;
            timer = setTimeout(tick, 320);
          }
        };
        tick();
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="studbot"
      ref={ref}
      style={{
        background: necro.bg,
        padding: 'clamp(100px, 13vw, 180px) 5vw',
        borderTop: `1px solid ${necro.line}`,
        borderBottom: `1px solid ${necro.line}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: 4,
            color: necro.ember,
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          {studbotConfig.sectionLabel}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(48px, 6vw, 100px)',
            alignItems: 'start',
          }}
        >
          {/* Wordmark + story */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34 }}>
              <img
                src={studbotConfig.mascotImage}
                alt="StudBot mascot"
                style={{
                  height: 88,
                  width: 'auto',
                  display: 'block',
                  filter: 'grayscale(1) contrast(1.1)',
                }}
              />
              <h2
                style={{
                  fontFamily: necro.display,
                  fontWeight: 700,
                  fontSize: 'clamp(38px, 4.4vw, 62px)',
                  letterSpacing: '0.06em',
                  color: necro.ash,
                  margin: 0,
                }}
              >
                {studbotConfig.name}
              </h2>
            </div>

            <p
              style={{
                fontFamily: MONO,
                fontSize: 13,
                letterSpacing: 3,
                color: necro.ash2,
                textTransform: 'uppercase',
                margin: '0 0 34px 0',
              }}
            >
              {studbotConfig.descriptor}
            </p>

            {studbotConfig.paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(18px, 1.7vw, 22px)',
                  lineHeight: 1.65,
                  color: i === 0 ? necro.ash : necro.ash2,
                  margin: '0 0 18px 0',
                }}
              >
                {p}
              </p>
            ))}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 34 }}>
              {studbotConfig.badges.map((b) => (
                <span
                  key={b}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: necro.ash,
                    border: `1px solid rgba(194,65,12,0.5)`,
                    padding: '7px 14px',
                    textTransform: 'uppercase',
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Terminal — agents running code */}
          <div
            ref={termRef}
            style={{
              border: `1px solid rgba(194,65,12,0.35)`,
              background: necro.panel,
            }}
          >
            {/* title bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: `1px solid ${necro.line}`,
              }}
            >
              <div style={{ display: 'flex', gap: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: necro.ember, boxShadow: `0 0 10px ${necro.ember}` }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(237,234,230,0.18)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(237,234,230,0.18)' }} />
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 1,
                  color: necro.ash2,
                }}
              >
                studbot@cloud-boxer — zsh
              </span>
            </div>
            {/* body */}
            <div style={{ padding: '22px 20px 26px', minHeight: 260 }}>
              {lines.map((l, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: MONO,
                    fontSize: 13.5,
                    lineHeight: 2,
                    margin: 0,
                    color: l.startsWith('✓')
                      ? necro.ash2
                      : l.includes('on shift')
                        ? necro.ember
                        : necro.ash,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {l.startsWith('✓') ? l : `❯ ${l}`}
                </p>
              ))}
              {current && (
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 13.5,
                    lineHeight: 2,
                    margin: 0,
                    color: necro.ash,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  ❯ {current}
                  <span className="ticker-caret">▌</span>
                </p>
              )}
              {!current && lines.length === studbotConfig.bootLines.length && (
                <p style={{ fontFamily: MONO, fontSize: 13.5, lineHeight: 2, margin: 0, color: necro.ember }}>
                  ❯ <span className="ticker-caret">▌</span>
                </p>
              )}
            </div>
            {/* status bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderTop: `1px solid ${necro.line}`,
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: 1,
                color: necro.ash2,
              }}
            >
              <span>
                <span style={{ color: necro.ember, textShadow: `0 0 8px ${necro.ember}` }}>●</span> RUNNING
              </span>
              <span>CPU 0.3% · RAM 412MB · UPTIME ∞</span>
            </div>
          </div>
        </div>

        <p
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 2,
            color: necro.ash2,
            marginTop: 26,
            textTransform: 'lowercase',
          }}
        >
          {studbotConfig.caption}
        </p>
      </div>
      {/* ember seam into the next movement */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${necro.burned}, transparent)`,
        }}
      />
    </section>
  );
}
