import { useRef } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, viewport } from '../lib/motion';

const ROW_1 = [
  'React', 'TypeScript', 'Three.js', 'Framer Motion', 'Node.js',
  'Vite', 'Tailwind CSS', 'SCSS', 'React Three Fiber', 'WebGL',
];
const ROW_2 = [
  'Express.js', 'Git', 'Shopware', 'REST APIs', 'dnd-kit',
  'CSS Grid', 'Accessibility', 'Scrum', 'PostgreSQL', 'Figma',
];

/* Individual tech badge */
const Badge = ({ label }: { label: string }) => (
  <span
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '11px', letterSpacing: '0.08em',
      color: 'rgba(148,163,184,0.5)',
      padding: '0.3rem 0.9rem',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.028)',
      border: '1px solid rgba(255,255,255,0.06)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      transition: 'color 0.2s, border-color 0.2s, background 0.2s',
      cursor: 'default',
      userSelect: 'none',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.color = 'rgba(147,197,253,0.85)';
      el.style.borderColor = 'rgba(96,165,250,0.22)';
      el.style.background = 'rgba(59,130,246,0.07)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.color = 'rgba(148,163,184,0.5)';
      el.style.borderColor = 'rgba(255,255,255,0.06)';
      el.style.background = 'rgba(255,255,255,0.028)';
    }}
  >
    {label}
  </span>
);

/* Dot separator */
const Sep = () => (
  <span aria-hidden="true" style={{
    display: 'inline-block', width: '3px', height: '3px', borderRadius: '50%',
    background: 'rgba(96,165,250,0.2)', flexShrink: 0, margin: '0 0.875rem',
  }} />
);

/* A single infinite-scrolling row */
const MarqueeRow = ({ items, reverse = false, speed = 32 }: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const doubled = [...items, ...items];

  return (
    <div
      style={{ overflow: 'hidden', width: '100%' }}
      onMouseEnter={() => { if (ref.current) ref.current.style.animationPlayState = 'paused'; }}
      onMouseLeave={() => { if (ref.current) ref.current.style.animationPlayState = 'running'; }}
    >
      <div
        ref={ref}
        style={{
          display: 'inline-flex', alignItems: 'center',
          width: 'max-content',
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
          willChange: 'transform',
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            <Badge label={item} />
            <Sep />
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Section ─────────────────────────────────────────────────────── */
export default function TechMarquee() {
  return (
    <section
      aria-label="Technology stack"
      style={{
        padding: 'clamp(1.25rem, 3vw, 2rem) 0',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        position: 'relative',
      }}
    >
      {/* Label — visible on wider screens only */}
      <div
        className="hidden lg:block"
        style={{
          position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, pointerEvents: 'none',
        }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(61,77,96,0.7)',
        }}>
          stack
        </span>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <MarqueeRow items={ROW_1} reverse={false} speed={35} />
        <MarqueeRow items={ROW_2} reverse={true}  speed={28} />
      </motion.div>
    </section>
  );
}
