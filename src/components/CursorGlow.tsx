import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useVisualMode } from '../contexts/VisualModeContext';

/**
 * Ambient cursor glow — a large, heavily blurred radial gradient
 * that trails the mouse cursor. Creates a subtle "light source" illusion.
 * In enhanced mode: larger blob, dual-color (blue + purple) glow.
 */
const CursorGlow = () => {
  const rawX  = useMotionValue(-800);
  const rawY  = useMotionValue(-800);
  const rawX2 = useMotionValue(-800);
  const rawY2 = useMotionValue(-800);

  // Primary — snappy
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  // Secondary (purple) — intentionally slower so it lags behind for depth
  const x2 = useSpring(rawX2, { stiffness: 28, damping: 18 });
  const y2 = useSpring(rawY2, { stiffness: 28, damping: 18 });

  const [visible, setVisible] = useState(false);
  const { enhanced } = useVisualMode();

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const PRIMARY_SIZE = enhanced ? 680 : 520;
    const PURPLE_SIZE  = 380;

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX - PRIMARY_SIZE / 2);
      rawY.set(e.clientY - PRIMARY_SIZE / 2);
      rawX2.set(e.clientX - PURPLE_SIZE / 2);
      rawY2.set(e.clientY - PURPLE_SIZE / 2);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enhanced]);

  const size = enhanced ? 680 : 520;

  return (
    <>
      {/* Primary blue glow */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: `${size}px`, height: `${size}px`,
          x, y,
          borderRadius: '50%',
          background: enhanced
            ? 'radial-gradient(circle, rgba(59,130,246,0.11) 0%, rgba(59,130,246,0.04) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.02) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 6,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          mixBlendMode: 'screen',
        }}
      />
      {/* Secondary lagging purple glow — enhanced only */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '380px', height: '380px',
          x: x2, y: y2,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.025) 45%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 6,
          opacity: visible && enhanced ? 1 : 0,
          transition: 'opacity 0.6s ease',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
};

export default CursorGlow;
