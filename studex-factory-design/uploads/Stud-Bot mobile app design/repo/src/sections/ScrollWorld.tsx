import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollWorldConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

/**
 * The Flight — scroll-world technique on cinematic stills.
 * A pinned stage; scroll scrubs a camera that dives INTO each scene
 * (scale 1 -> deep zoom), cross-dissolving to the next scene exactly at
 * maximum depth so the seam reads as continuous flight, never a cut.
 * Structure mirrors the video-chain version: when Higgsfield/Monid clips
 * exist, each still swaps for a scrubbed clip with identical seams.
 */
export default function ScrollWorld() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLDivElement>(null);

  const scenes = scrollWorldConfig.scenes;
  const N = scenes.length;

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    const ctx = gsap.context(() => {
      // GSAP pin (not CSS sticky — an ancestor's overflow-x:hidden breaks sticky)
      ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        endTrigger: wrap,
        end: 'bottom bottom',
        pin: true,
        pinSpacing: false,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            if (counterRef.current) {
              const idx = Math.min(N, Math.floor(self.progress * N) + 1);
              counterRef.current.textContent = `SCENE ${String(idx).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
            }
          },
        },
      });

      scenes.forEach((_, i) => {
        const scene = sceneRefs.current[i];
        const caption = captionRefs.current[i];
        if (!scene) return;
        const img = scene.querySelector('img');

        if (i > 0) {
          // enter: fade in as previous hits max depth (the seam)
          tl.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none' }, i - 0.6);
        }
        // dive: continuous zoom into the heart of the scene
        tl.fromTo(
          img,
          { scale: i === 0 ? 1 : 1.12 },
          { scale: 1.85, duration: 1, ease: 'power1.in' },
          i
        );
        if (caption) {
          tl.fromTo(caption, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, i + 0.08);
          if (i < N - 1) {
            tl.to(caption, { opacity: 0, y: -20, duration: 0.25, ease: 'power2.in' }, i + 0.7);
          }
        }
        if (i < N - 1) {
          // handoff: at full depth the next scene is already beneath — fade current out
          tl.to(scene, { opacity: 0, duration: 0.3, ease: 'none' }, i + 0.7);
        }
      });
      tl.to({}, { duration: 0.35 }); // linger on the last scene
    }, wrap);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="flight" ref={wrapRef} style={{ height: `${(N + 1) * 100}vh`, position: 'relative', background: '#050505' }}>
      <div ref={stageRef} style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {scenes.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => { sceneRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === 0 ? 1 : 0,
              willChange: 'opacity',
            }}
          >
            <img
              src={s.image}
              alt={s.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                willChange: 'transform',
                filter: 'brightness(0.82) saturate(1.05)',
              }}
              loading={i < 2 ? 'eager' : 'lazy'}
            />
            {/* vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center, transparent 42%, rgba(5,5,5,0.55) 100%)',
                pointerEvents: 'none',
              }}
            />
            <div
              ref={(el) => { captionRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                left: '5vw',
                bottom: '12vh',
                maxWidth: 620,
                opacity: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 11,
                  letterSpacing: 4,
                  color: '#ff2a1a',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                  textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                }}
              >
                {s.kicker}
              </div>
              <div
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(30px, 3.6vw, 52px)',
                  lineHeight: 1.1,
                  color: '#ffffff',
                  textShadow: '0 4px 28px rgba(0,0,0,0.95)',
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(16px, 1.6vw, 21px)',
                  lineHeight: 1.5,
                  color: 'rgba(245,240,232,0.85)',
                  marginTop: 14,
                  textShadow: '0 2px 16px rgba(0,0,0,0.9)',
                }}
              >
                {s.line}
              </div>
            </div>
          </div>
        ))}

        {/* HUD: section label + scene counter */}
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: '5vw',
            fontFamily: "'Fira Code', monospace",
            fontSize: 11,
            letterSpacing: 3,
            color: 'rgba(245,240,232,0.6)',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            zIndex: 5,
          }}
        >
          {scrollWorldConfig.sectionLabel}
        </div>
        <div
          ref={counterRef}
          style={{
            position: 'absolute',
            top: 130,
            right: '5vw',
            fontFamily: "'Fira Code', monospace",
            fontSize: 11,
            letterSpacing: 3,
            color: 'rgba(255,42,26,0.9)',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            zIndex: 5,
          }}
        >
          SCENE 01 / {String(N).padStart(2, '0')}
        </div>
      </div>
    </section>
  );
}
