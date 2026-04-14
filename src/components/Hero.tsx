import { lazy, Suspense, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import QuickTourButton from './QuickTourButton';

/* Lazy-load the Three.js canvas — defers the ~300 KB gzip vendor-three chunk
   until after first paint. The Suspense fallback={null} means no layout shift. */
const HeroCanvas = lazy(() => import('./HeroCanvas'));
import { fadeUp, stagger } from '../lib/motion';

/* Touch device — disable mouse parallax */
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/* ── Status badge ─────────────────────────────────────────────────── */
const StatusBadge = () => (
  <motion.div
    variants={fadeUp}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.4rem 0.875rem', borderRadius: '999px', marginBottom: '1.75rem',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.2)',
    }}
  >
    <span style={{ position: 'relative', display: 'flex', width: '7px', height: '7px' }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'var(--green)', opacity: 0.6,
        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ position: 'relative', borderRadius: '50%', width: '7px', height: '7px', background: 'var(--green)' }} />
    </span>
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '11px', color: 'rgba(52,211,153,0.9)', letterSpacing: '0.06em',
    }}>
      Available for work
    </span>
  </motion.div>
);

const pingKeyframes = `@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`;

const Hero = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  /* Mouse parallax — skipped on touch */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x  = useSpring(rawX, { stiffness: 30, damping: 22 });
  const y  = useSpring(rawY, { stiffness: 30, damping: 22 });
  const cx = useTransform(x, v => -v * 0.35);
  const cy = useTransform(y, v => -v * 0.25);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (IS_TOUCH) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - r.left)  / r.width  - 0.5) * 24);
    rawY.set(((e.clientY - r.top)   / r.height - 0.5) * 16);
  }, [rawX, rawY]);

  const onMouseLeave = useCallback(() => {
    if (!IS_TOUCH) { rawX.set(0); rawY.set(0); }
  }, [rawX, rawY]);

  const scrollTo = useCallback((id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), []);

  /* Apply parallax only on non-touch — memoized so objects are stable across renders */
  const textMotion   = useMemo(() => IS_TOUCH ? {} : { x, y },       [x, y]);
  const canvasMotion = useMemo(() => IS_TOUCH ? {} : { x: cx, y: cy }, [cx, cy]);

  return (
    <>
      <style>{pingKeyframes}</style>
      <section
        ref={sectionRef}
        id="hero"
        style={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingTop: '62px', overflow: 'hidden',
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Grid mesh — hidden on mobile to reduce noise */}
        <div aria-hidden="true" className="hidden sm:block" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black 25%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black 25%, transparent 100%)',
        }} />

        {/* HUD corner brackets — desktop only */}
        <div aria-hidden="true" className="hidden lg:block" style={{ position: 'absolute', top: '5rem', left: '1.5rem', width: '20px', height: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none', zIndex: 2 }} />
        <div aria-hidden="true" className="hidden lg:block" style={{ position: 'absolute', top: '5rem', right: '1.5rem', width: '20px', height: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none', zIndex: 2 }} />
        <div aria-hidden="true" className="hidden lg:block" style={{ position: 'absolute', bottom: '3rem', left: '1.5rem', width: '20px', height: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none', zIndex: 2 }} />
        <div aria-hidden="true" className="hidden lg:block" style={{ position: 'absolute', bottom: '3rem', right: '1.5rem', width: '20px', height: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none', zIndex: 2 }} />

        {/* Responsive two-column grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 items-center w-full"
          style={{
            maxWidth: '1200px', margin: '0 auto',
            padding: 'clamp(2.5rem, 8vw, 5rem) clamp(1rem, 4vw, 1.5rem)',
            position: 'relative', zIndex: 1,
            gap: 'clamp(2.5rem, 6vw, 5rem)',
          }}
        >
          {/* ── Text column ─────────────────────────────────── */}
          <motion.div
            style={textMotion}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <StatusBadge />

            {/* Split name */}
            <motion.h1
              variants={fadeUp}
              style={{ margin: '0 0 1.25rem', lineHeight: 1.0 }}
            >
              <span style={{
                display: 'block',
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(2.75rem, 9vw, 6.5rem)',
                color: '#EEF2FF', letterSpacing: '-0.02em',
              }}>
                {t('hero.name').split(' ')[0]}
              </span>
              <span style={{
                display: 'block',
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(2.75rem, 9vw, 6.5rem)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(100deg, var(--blue-l) 0%, var(--purple-l, #A78BFA) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {t('hero.name').split(' ').slice(1).join(' ')}.
              </span>
            </motion.h1>

            {/* Role */}
            <motion.div variants={fadeUp}
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '28px', height: '1px', background: 'rgba(96,165,250,0.5)', flexShrink: 0 }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'rgba(147,197,253,0.8)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Frontend Developer
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={fadeUp} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)', lineHeight: 1.75,
              color: 'rgba(139,150,170,0.9)',
              maxWidth: '440px', marginBottom: '0.875rem',
            }}>
              {t('hero.tagline')}
            </motion.p>

            {/* Currently at */}
            <motion.p variants={fadeUp} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', letterSpacing: '0.06em',
              color: 'rgba(61,77,96,0.95)', marginBottom: '2rem',
            }}>
              @ WEBneo GmbH &nbsp;·&nbsp; Berlin, Germany
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                onClick={() => scrollTo('projects')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px',
                  color: '#fff',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: '8px',
                  background: 'var(--blue)', border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  transition: 'background 0.25s, box-shadow 0.25s',
                  minHeight: '44px',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = 'var(--blue-l)';
                  b.style.boxShadow  = '0 0 36px rgba(59,130,246,0.6), inset 0 1px 0 rgba(255,255,255,0.1)';
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = 'var(--blue)';
                  b.style.boxShadow  = '0 0 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.08)';
                }}
              >
                View Projects <ArrowRight size={14} />
              </button>

              <button
                onClick={() => scrollTo('contact')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px',
                  color: 'rgba(203,213,225,0.9)',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', transition: 'all 0.25s',
                  minHeight: '44px',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = 'rgba(96,165,250,0.4)';
                  b.style.background  = 'rgba(59,130,246,0.07)';
                  b.style.color       = '#EEF2FF';
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = 'rgba(255,255,255,0.1)';
                  b.style.background  = 'rgba(255,255,255,0.04)';
                  b.style.color       = 'rgba(203,213,225,0.9)';
                }}
              >
                <Mail size={14} /> Contact Me
              </button>
            </motion.div>

            {/* Quick tour */}
            <motion.div variants={fadeUp} style={{ marginTop: '1.25rem' }}>
              <QuickTourButton />
            </motion.div>
          </motion.div>

          {/* ── 3D canvas column — hidden on mobile/tablet ─────────── */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            style={canvasMotion}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              position: 'relative', width: '100%', maxWidth: '480px',
              height: 'clamp(320px, 38vw, 480px)',
              filter: 'drop-shadow(0 0 50px rgba(59,130,246,0.16))',
            }}>
              <div aria-hidden="true" style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%', height: '60%', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <Suspense fallback={null}>
                <HeroCanvas />
              </Suspense>
            </div>
          </motion.div>

        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          style={{
            position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
            pointerEvents: 'none', zIndex: 2,
          }}
        >
          <motion.div
            animate={{ scaleY: [1, 0.45, 1], opacity: [0.28, 0.65, 0.28] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, transparent, rgba(148,163,184,0.4), transparent)' }}
          />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(61,77,96,0.8)',
          }}>scroll</span>
        </motion.div>

      </section>
    </>
  );
};

export default Hero;
