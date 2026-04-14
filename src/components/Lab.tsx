import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, viewport } from '../lib/motion';

/* ── Experiment 1: Dot Wave canvas ──────────────────────────────── */
const DotWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let lastFrame = 0;
    const FRAME_BUDGET = 1000 / 50; // 50fps cap keeps it smooth without overdrive

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);
      if (now - lastFrame < FRAME_BUDGET) return;
      lastFrame = now;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const cols = 22, rows = 7;
      const cw = W / cols, rh = H / rows;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const wave    = Math.sin(c * 0.45 + r * 0.65 + t);
          const size    = 1.4 + wave * 1.4;
          const opacity = 0.12 + (wave + 1) * 0.22;
          const hue     = 220 + (c / cols) * 55; /* blue → purple */

          ctx.fillStyle = `hsla(${hue}, 72%, 68%, ${opacity})`;
          ctx.beginPath();
          ctx.arc(c * cw + cw / 2, r * rh + rh / 2, Math.max(0.1, size), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      t += 0.022;
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

/* ── Experiment 2: Scramble Text ─────────────────────────────────── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01';

function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  const tickRef  = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const iterRef  = useRef(0);

  const scramble = useCallback(() => {
    clearInterval(tickRef.current);
    iterRef.current = 0;
    tickRef.current = setInterval(() => {
      setDisplay(
        text.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iterRef.current) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      iterRef.current += 0.6;
      if (iterRef.current >= text.length) {
        clearInterval(tickRef.current);
        setDisplay(text);
      }
    }, 28);
  }, [text]);

  const restore = useCallback(() => {
    clearInterval(tickRef.current);
    setDisplay(text);
  }, [text]);

  useEffect(() => () => clearInterval(tickRef.current), []);
  return { display, scramble, restore };
}

const ScrambleDemo = () => {
  const lines = [
    useScramble('const portfolio = {'),
    useScramble("  developer: 'Leon Hecke',"),
    useScramble("  stack:  ['React', 'TS', 'Three.js'],"),
    useScramble("  status: 'open to work',"),
    useScramble('};'),
  ];

  // lines[].scramble / .restore are stable useCallback refs — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEnter = useCallback(() => lines.forEach(l => l.scramble()), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLeave = useCallback(() => lines.forEach(l => l.restore()), []);

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '1.5rem',
        cursor: 'default',
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'clamp(10px, 1.8vw, 13px)',
          lineHeight: 1.75,
          color: i === 0 || i === lines.length - 1
            ? 'rgba(167,139,250,0.7)'
            : i === 3
            ? 'rgba(52,211,153,0.75)'
            : 'rgba(147,197,253,0.7)',
          whiteSpace: 'pre',
          userSelect: 'none',
        }}>
          {line.display}
        </div>
      ))}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px', color: 'rgba(61,77,96,0.7)',
        marginTop: '1.25rem', fontStyle: 'italic',
      }}>
        hover to scramble
      </p>
    </div>
  );
};

/* ── Lab section ─────────────────────────────────────────────────── */
const EXPERIMENTS = [
  {
    id: 'dot-wave',
    tag: 'Canvas · Generative',
    title: 'Dot Wave',
    desc: 'A grid of 154 dots animated by layered sine functions — blending blue into purple across the field.',
    content: <DotWave />,
    contentStyle: { height: 'clamp(130px, 20vw, 160px)' },
  },
  {
    id: 'scramble',
    tag: 'JS · Interaction',
    title: 'Scramble Text',
    desc: 'Characters randomly cycle through the alphabet before snapping to their final glyphs. Hover to trigger.',
    content: <ScrambleDemo />,
    contentStyle: { height: 'clamp(130px, 20vw, 160px)' },
  },
];

const Lab = () => (
  <section id="lab" style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 7rem) clamp(1rem, 4vw, 1.5rem)' }}>
    {/* Ambient glow */}
    <div aria-hidden="true" style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px', height: '400px', pointerEvents: 'none',
      background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)',
    }} />

    <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        style={{ marginBottom: '3.5rem' }}
      >
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px', color: 'rgba(96,165,250,0.8)',
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem',
        }}>
          Creative Experiments
        </p>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EEF2FF',
          margin: '0 0 0.75rem', letterSpacing: '-0.02em',
        }}>
          // Lab
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14.5px', color: 'rgba(148,163,184,0.55)',
          maxWidth: '500px', lineHeight: 1.65, margin: 0,
        }}>
          Small contained experiments exploring generative graphics, motion, and interaction design.
        </p>
      </motion.div>

      {/* Experiment cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: '1.25rem' }}
      >
        {EXPERIMENTS.map(exp => (
          <motion.div
            key={exp.id}
            variants={fadeUp}
            style={{
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
              transition: 'border-color 0.25s, box-shadow 0.25s',
            }}
            whileHover={{
              borderColor: 'rgba(96,165,250,0.2)',
              boxShadow: '0 0 40px rgba(59,130,246,0.06)',
            }}
          >
            {/* Canvas/demo area */}
            <div style={{
              ...exp.contentStyle,
              background: 'rgba(0,0,0,0.25)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden', position: 'relative',
            }}>
              {exp.content}
            </div>

            {/* Info */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px', letterSpacing: '0.12em',
                  color: 'rgba(61,77,96,0.85)', textTransform: 'uppercase',
                }}>
                  {exp.tag}
                </span>
              </div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '1rem', color: '#EEF2FF',
                margin: '0 0 0.5rem',
              }}>
                {exp.title}
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px', color: 'rgba(148,163,184,0.6)',
                lineHeight: 1.65, margin: 0,
              }}>
                {exp.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  </section>
);

export default Lab;
