import { lazy, Suspense, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import QuickTourButton from './QuickTourButton';
import './Hero.css';

const HeroCanvas = lazy(() => import('./HeroCanvas'));
import { fadeUp, stagger } from '../lib/motion';

const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/* ── Status badge ─────────────────────────────────────────────────── */
const StatusBadge = ({ text }: { text: string }) => (
  <motion.div variants={fadeUp} className="hero-status-badge">
    <span className="hero-status-ping-wrapper">
      <span className="hero-status-ping-ring" />
      <span className="hero-status-ping-dot" />
    </span>
    <span className="hero-status-text">{text}</span>
  </motion.div>
);

const Hero = () => {
  const { t } = useLanguage();
  const { content } = useContent();
  const sectionRef = useRef<HTMLElement>(null);

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

  const canvasMotion = useMemo(() => IS_TOUCH ? {} : { x: cx, y: cy }, [cx, cy]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Grid mesh */}
      <div aria-hidden="true" className="hero-grid-mesh hidden sm:block" />

      {/* HUD corner brackets */}
      <div aria-hidden="true" className="hero-hud-corner hero-hud-tl hidden lg:block" />
      <div aria-hidden="true" className="hero-hud-corner hero-hud-tr hidden lg:block" />
      <div aria-hidden="true" className="hero-hud-corner hero-hud-bl hidden lg:block" />
      <div aria-hidden="true" className="hero-hud-corner hero-hud-br hidden lg:block" />

      {/* Two-column grid */}
      <div className="hero-grid grid grid-cols-1 lg:grid-cols-2 items-center w-full">

        {/* ── Text column ──────────────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <StatusBadge text={content.hero.status} />

          <motion.h1 variants={fadeUp} className="hero-heading">
            <span className="hero-name-first">
              {t('hero.name').split(' ')[0]}
            </span>
            <span className="hero-name-last">
              {t('hero.name').split(' ').slice(1).join(' ')}.
            </span>
          </motion.h1>

          <motion.div variants={fadeUp} className="hero-role">
            <div className="hero-role-line" />
            <span className="hero-role-text">{content.hero.role}</span>
          </motion.div>

          <motion.p variants={fadeUp} className="hero-tagline">
            {t('hero.tagline')}
          </motion.p>

          <motion.p variants={fadeUp} className="hero-location">
            {content.hero.location}
          </motion.p>

          <motion.div variants={fadeUp} className="hero-ctas">
            <button className="hero-btn-primary" onClick={() => scrollTo('projects')}>
              View Projects <ArrowRight size={14} />
            </button>
            <button className="hero-btn-secondary" onClick={() => scrollTo('contact')}>
              <Mail size={14} /> Contact Me
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="hero-quick-tour">
            <QuickTourButton />
          </motion.div>
        </motion.div>

        {/* ── 3D canvas column ─────────────────────────────────────── */}
        <motion.div
          className="hidden lg:flex justify-center items-center"
          style={canvasMotion}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-canvas-wrapper">
            <div aria-hidden="true" className="hero-canvas-glow" />
            <Suspense fallback={null}>
              <HeroCanvas />
            </Suspense>
          </div>
        </motion.div>

      </div>

      {/* Scroll cue */}
      <motion.div
        className="hero-scroll-cue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <motion.div
          className="hero-scroll-line"
          animate={{ scaleY: [1, 0.45, 1], opacity: [0.28, 0.65, 0.28] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="hero-scroll-label">scroll</span>
      </motion.div>

    </section>
  );
};

export default Hero;
