import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useVisualMode } from '../contexts/VisualModeContext';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const { enhanced } = useVisualMode();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          title="Back to top"
          aria-label="Scroll back to top"
          style={{
            position: 'fixed',
            bottom: '1.75rem',
            right: '1.75rem',
            zIndex: 120,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: `1px solid ${enhanced ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.1)'}`,
            background: enhanced
              ? 'rgba(59,130,246,0.12)'
              : 'rgba(11,17,32,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: enhanced ? 'rgba(147,197,253,0.9)' : 'rgba(148,163,184,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: enhanced
              ? '0 0 20px rgba(59,130,246,0.2), 0 4px 16px rgba(0,0,0,0.4)'
              : '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'border-color 0.3s, background 0.3s, color 0.3s, box-shadow 0.3s',
          }}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
