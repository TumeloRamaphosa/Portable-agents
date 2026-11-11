import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { deploymentConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Deployment() {
  const wrapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.deploy-step',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: { trigger: wrapRef.current, start: 'top 75%' },
        }
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  if (!deploymentConfig.heading) return null;

  return (
    <section
      id="deployment"
      ref={wrapRef}
      style={{
        background: '#080808',
        padding: '130px 5vw',
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid rgba(255,42,26,0.12)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
          {deploymentConfig.sectionLabel}
        </p>
        <h2
          style={{
            fontFamily: "'EB Garamond', serif",
            fontWeight: 400,
            fontSize: 'clamp(34px, 4.2vw, 64px)',
            lineHeight: 1.15,
            color: '#ffffff',
            maxWidth: 900,
            marginBottom: 80,
          }}
        >
          {deploymentConfig.heading}
        </h2>

        <div>
          {deploymentConfig.steps.map((step, i) => (
            <div
              key={step.numeral}
              className="deploy-step"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 'clamp(24px, 4vw, 64px)',
                padding: '44px 0',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(40px, 4vw, 60px)',
                  color: i === deploymentConfig.steps.length - 1 ? '#ff2a1a' : 'rgba(255,255,255,0.25)',
                  lineHeight: 1,
                }}
              >
                {step.numeral}
              </span>
              <div>
                <h3
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: 'clamp(24px, 2.4vw, 34px)',
                    fontWeight: 500,
                    color: '#ffffff',
                    marginBottom: 12,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16,
                    fontWeight: 300,
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.55)',
                    maxWidth: 720,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
