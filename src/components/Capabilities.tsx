import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Wand2, Zap, TrendingUp, Layers, Globe, Coffee } from 'lucide-react';
import { fadeUp, stagger, viewport } from '../lib/motion';

/* ── Count-up hook ───────────────────────────────────────────────── */
function useCountUp(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, target, duration]);

  return val;
}

/* ── Stats bar ───────────────────────────────────────────────────── */
const STATS = [
  { target: 3,   suffix: '+',  label: 'Years\nExperience',   icon: TrendingUp, color: 'rgba(96,165,250,0.9)'  },
  { target: 15,  suffix: '+',  label: 'Projects\nDelivered', icon: Layers,     color: 'rgba(167,139,250,0.9)' },
  { target: 10,  suffix: '+',  label: 'Technologies\nUsed',  icon: Zap,        color: 'rgba(52,211,153,0.9)'  },
  { target: 100, suffix: '%',  label: 'Remote\nReady',       icon: Globe,      color: 'rgba(251,191,36,0.9)'  },
];

const StatItem = ({ stat, active }: { stat: typeof STATS[0]; active: boolean }) => {
  const count = useCountUp(stat.target, 1.4, active);
  const Icon  = stat.icon;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
      padding: 'clamp(1rem, 3vw, 1.5rem) clamp(0.75rem, 2vw, 1.5rem)',
      flex: 1, minWidth: 0,
    }}>
      <Icon size={14} color={stat.color} style={{ flexShrink: 0 }} />
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        color: '#EEF2FF', lineHeight: 1,
        letterSpacing: '-0.03em',
      }}>
        {count}{stat.suffix}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'rgba(100,116,139,0.8)', textAlign: 'center', whiteSpace: 'pre-line',
        lineHeight: 1.5,
      }}>
        {stat.label}
      </div>
    </div>
  );
};

const StatsBar = () => {
  const ref  = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', flexWrap: 'wrap',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        marginBottom: 'clamp(3rem, 6vw, 5rem)',
      }}
    >
      {STATS.map((stat, i) => (
        <div key={i} style={{ display: 'flex', flex: '1 1 120px', minWidth: 0 }}>
          <StatItem stat={stat} active={started} />
          {i < STATS.length - 1 && (
            <div style={{
              width: '1px', alignSelf: 'stretch',
              background: 'rgba(255,255,255,0.05)',
              flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Animated card backgrounds ────────────────────────────────────── */

/* Card 1: Grid mesh with pulse */
const GridBg = ({ visible }: { visible: boolean }) => (
  <div style={{
    position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden',
    opacity: visible ? 0.7 : 0.25, transition: 'opacity 0.5s ease',
    backgroundImage:
      'linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px),' +
      'linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  }} />
);

/* Card 2: Orbiting particles */
const OrbitBg = ({ visible }: { visible: boolean }) => (
  <div style={{
    position: 'absolute', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    opacity: visible ? 1 : 0.3, transition: 'opacity 0.5s ease',
    pointerEvents: 'none',
  }}>
    {/* Static rings */}
    {[44, 66, 88].map((r, i) => (
      <div key={i} style={{
        position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%',
        border: `1px solid rgba(167,139,250,${0.12 - i * 0.03})`,
      }} />
    ))}
    {/* Orbiting dots */}
    {(['orbit-a', 'orbit-b', 'orbit-c'] as const).map((cls, i) => (
      <div key={cls} style={{
        position: 'absolute', width: '5px', height: '5px', borderRadius: '50%',
        background: `rgba(167,139,250,${0.7 - i * 0.15})`,
        animation: `${cls} ${3 + i}s linear infinite`,
        transformOrigin: '50% 50%',
      }} />
    ))}
  </div>
);

/* Card 3: Node graph */
const NodeBg = ({ visible }: { visible: boolean }) => {
  const nodes = [
    { x: 30, y: 30 }, { x: 70, y: 25 }, { x: 20, y: 65 },
    { x: 60, y: 70 }, { x: 80, y: 55 }, { x: 45, y: 50 },
  ];
  const edges = [[0,5],[1,5],[2,5],[3,5],[4,5],[0,2],[1,4],[3,4]];

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit',
      opacity: visible ? 1 : 0.3, transition: 'opacity 0.5s ease', pointerEvents: 'none',
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {edges.map(([a, b], i) => (
          <line key={i}
            x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
            x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke="rgba(52,211,153,0.2)" strokeWidth="1"
            strokeDasharray="120" strokeDashoffset={visible ? 0 : 120}
            style={{ transition: `stroke-dashoffset 0.6s ease ${i * 0.08}s` }}
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i}
            cx={`${n.x}%`} cy={`${n.y}%`} r="3"
            fill="rgba(52,211,153,0.55)"
            style={{ animation: `node-pulse 2s ease-in-out infinite ${i * 0.3}s` }}
          />
        ))}
      </svg>
    </div>
  );
};

/* ── Capability card ──────────────────────────────────────────────── */
interface CapData {
  number: string;
  Icon: React.FC<{ size?: number; color?: string }>;

  title: string;
  headline: string;
  body: string;
  tools: string[];
  accent: string;
  accentBg: string;
  accentBorder: string;
  Bg: React.FC<{ visible: boolean }>;
}

const CAPS: CapData[] = [
  {
    number: '01', Icon: Monitor,
    title: 'Interfaces',
    headline: 'Pixel-perfect UI development',
    body: 'Crafting responsive, accessible React applications with clean architecture, semantic markup, and obsessive attention to detail.',
    tools: ['React', 'TypeScript', 'Tailwind CSS', 'SCSS'],
    accent: '#60A5FA', accentBg: 'rgba(59,130,246,0.07)', accentBorder: 'rgba(96,165,250,0.28)',
    Bg: GridBg,
  },
  {
    number: '02', Icon: Wand2,
    title: 'Motion & 3D',
    headline: 'Animation and spatial experiences',
    body: 'Bringing depth and life to the web through fluid animations, page transitions, and interactive 3D scenes built with Three.js.',
    tools: ['Three.js', 'R3F', 'Framer Motion', 'WebGL'],
    accent: '#A78BFA', accentBg: 'rgba(124,58,237,0.07)', accentBorder: 'rgba(167,139,250,0.28)',
    Bg: OrbitBg,
  },
  {
    number: '03', Icon: Coffee,
    title: 'Architecture',
    headline: 'Scalable and performant systems',
    body: 'Building robust frontend foundations — clean APIs, optimized bundles, developer-friendly codebases that teams actually enjoy working in.',
    tools: ['Node.js', 'Vite', 'Express', 'REST APIs'],
    accent: '#34D399', accentBg: 'rgba(16,185,129,0.07)', accentBorder: 'rgba(52,211,153,0.28)',
    Bg: NodeBg,
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const CapCard = ({ cap }: { cap: CapData }) => {
  const [hovered, setHovered] = useState(false);
  const { Icon, Bg } = cap;

  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '20px', overflow: 'hidden',
        padding: 'clamp(1.5rem, 3vw, 2rem)',
        background: hovered ? cap.accentBg : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered ? cap.accentBorder : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered ? `0 0 40px ${cap.accentBg}` : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
        cursor: 'default', minHeight: '280px',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Animated SVG background */}
      <Bg visible={hovered} />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          {/* Number watermark */}
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: hovered ? '1rem' : '3.5rem',
            color: hovered ? cap.accent : 'rgba(255,255,255,0.06)',
            lineHeight: 1, letterSpacing: '-0.04em',
            transition: 'font-size 0.4s ease, color 0.4s ease',
          }}>
            {cap.number}
          </span>

          {/* Icon */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: hovered ? cap.accentBg : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hovered ? cap.accentBorder : 'rgba(255,255,255,0.07)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s, border-color 0.3s',
            flexShrink: 0,
          }}>
            <Icon size={16} color={hovered ? cap.accent : 'rgba(148,163,184,0.6)'} />
          </div>
        </div>

        {/* Divider line that grows on hover */}
        <div style={{
          height: '1px', borderRadius: '1px', marginBottom: '1rem',
          background: hovered
            ? `linear-gradient(to right, ${cap.accent}, transparent)`
            : 'rgba(255,255,255,0.07)',
          transition: 'background 0.4s ease',
        }} />

        {/* Title */}
        <h3 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
          color: hovered ? '#EEF2FF' : 'rgba(238,242,255,0.85)',
          marginBottom: '0.625rem', lineHeight: 1.2,
          letterSpacing: '-0.01em', transition: 'color 0.3s',
        }}>
          {cap.title}
        </h3>

        {/* Headline */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px', color: hovered ? cap.accent : 'rgba(148,163,184,0.5)',
          marginBottom: '0', lineHeight: 1.5, fontStyle: 'italic',
          transition: 'color 0.3s',
        }}>
          {cap.headline}
        </p>

        {/* Revealed: body + tools */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease }}
              style={{ marginTop: '1rem' }}
            >
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13.5px', color: 'rgba(148,163,184,0.75)',
                lineHeight: 1.7, marginBottom: '1.25rem',
              }}>
                {cap.body}
              </p>

              {/* Tool tags with stagger */}
              <motion.div
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}
              >
                {cap.tools.map(tool => (
                  <motion.span
                    key={tool}
                    variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } }}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px', letterSpacing: '0.06em',
                      padding: '3px 10px', borderRadius: '6px',
                      background: cap.accentBg,
                      border: `1px solid ${cap.accentBorder}`,
                      color: cap.accent,
                    }}
                  >
                    {tool}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ── Section ─────────────────────────────────────────────────────── */
export default function Capabilities() {
  return (
    <section
      id="capabilities"
      style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 7rem) clamp(1rem, 4vw, 1.5rem)' }}
    >
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: '0',
        transform: 'translateX(-50%)',
        width: '600px', height: '400px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          <motion.p variants={fadeUp} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', color: 'rgba(96,165,250,0.8)',
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            Expertise
          </motion.p>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EEF2FF',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            What I Build
          </motion.h2>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <StatsBar />
        </motion.div>

        {/* Capability cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: '1rem' }}
        >
          {CAPS.map(cap => <CapCard key={cap.number} cap={cap} />)}
        </motion.div>

        {/* Hint label */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(61,77,96,0.7)', textAlign: 'center', marginTop: '1.5rem',
          }}
        >
          hover cards to explore
        </motion.p>
      </div>
    </section>
  );
}
