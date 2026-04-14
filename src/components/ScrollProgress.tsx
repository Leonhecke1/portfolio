import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin reading-progress bar pinned to the very top of the viewport.
 * 2 px high, blue → purple gradient, spring-smoothed.
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        zIndex: 200,
        scaleX,
        transformOrigin: '0%',
        background: 'linear-gradient(to right, #3B82F6, #7C3AED)',
        boxShadow: '0 0 8px rgba(59,130,246,0.6)',
      }}
    />
  );
};

export default ScrollProgress;
