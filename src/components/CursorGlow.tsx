import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Ambient cursor glow — a large, heavily blurred radial gradient
 * that trails the mouse cursor. Creates a subtle "light source" illusion.
 * Hidden on touch devices and when cursor leaves the window.
 */
const CursorGlow = () => {
  const rawX = useMotionValue(-600);
  const rawY = useMotionValue(-600);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* Only enable on pointer devices */
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const SIZE = 520;
    const HALF = SIZE / 2;

    const move = (e: MouseEvent) => {
      rawX.set(e.clientX - HALF);
      rawY.set(e.clientY - HALF);
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
    // rawX / rawY are stable MotionValue references — never recreated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '520px',
        height: '520px',
        x,
        y,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.02) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 6,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default CursorGlow;
