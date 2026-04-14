import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

const STEPS = [
  { id: 'hero',                  label: 'Intro'      },
  { id: 'about',                 label: 'About'      },
  { id: 'spacestation-timeline', label: 'Career'     },
  { id: 'projects',              label: 'Projects'   },
  { id: 'lab',                   label: 'Lab'        },
  { id: 'contact',               label: 'Contact'    },
];

const STEP_DURATION = 3200; // ms per section

export default function QuickTourButton() {
  const [running, setRunning]     = useState(false);
  const [stepIdx, setStepIdx]     = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    STEPS.forEach(s => document.getElementById(s.id)?.removeAttribute('data-tour'));
  };

  const stopTour = () => {
    clearAll();
    setRunning(false);
    setStepIdx(0);
  };

  const startTour = () => {
    clearAll();
    setRunning(true);
    setStepIdx(0);

    STEPS.forEach((step, i) => {
      const offset = i * STEP_DURATION;

      /* Scroll + highlight */
      const t1 = setTimeout(() => {
        document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById(step.id)?.setAttribute('data-tour', 'active');
        setStepIdx(i);
      }, offset);

      /* Remove highlight */
      const t2 = setTimeout(() => {
        document.getElementById(step.id)?.removeAttribute('data-tour');
      }, offset + STEP_DURATION - 400);

      timers.current.push(t1, t2);
    });

    /* End tour */
    const done = setTimeout(() => {
      setRunning(false);
      setStepIdx(0);
    }, STEPS.length * STEP_DURATION);
    timers.current.push(done);
  };

  /* Cleanup on unmount */
  useEffect(() => () => clearAll(), []);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={running ? stopTour : startTour}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px', letterSpacing: '0.08em',
          color: running ? 'rgba(239,68,68,0.75)' : 'rgba(96,165,250,0.6)',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 0', transition: 'color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = running
            ? 'rgba(239,68,68,1)' : 'rgba(96,165,250,1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = running
            ? 'rgba(239,68,68,0.75)' : 'rgba(96,165,250,0.6)';
        }}
      >
        {running ? <X size={11} /> : <MapPin size={11} />}
        {running ? 'stop tour' : '/ quick tour'}
      </button>

      {/* Floating progress indicator */}
      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 1rem',
              borderRadius: '999px',
              background: 'rgba(7,10,18,0.92)',
              border: '1px solid rgba(96,165,250,0.2)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Step label */}
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px', letterSpacing: '0.1em',
              color: 'rgba(96,165,250,0.9)', whiteSpace: 'nowrap',
              textTransform: 'uppercase',
            }}>
              {STEPS[stepIdx]?.label}
            </span>

            {/* Step dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '5px', borderRadius: '3px',
                    width: i === stepIdx ? '14px' : '5px',
                    background: i === stepIdx
                      ? 'rgba(96,165,250,0.9)'
                      : i < stepIdx
                      ? 'rgba(96,165,250,0.35)'
                      : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.4s ease',
                  }}
                />
              ))}
            </div>

            {/* Stop */}
            <button
              onClick={stopTour}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(100,116,139,0.7)',
                display: 'flex', alignItems: 'center', padding: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.8)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(100,116,139,0.7)'; }}
              title="Stop tour"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
