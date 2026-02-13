import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../contexts/MissionControlContext';
import './BootSequence.css';

interface BootSequenceProps {
  onComplete: () => void;
}

const bootLines = [
  { text: 'INITIALIZING MISSION CONTROL...', delay: 0 },
  { text: 'LOADING NEURAL INTERFACE...', delay: 400 },
  { text: 'ESTABLISHING QUANTUM LINK...', delay: 800 },
  { text: 'CALIBRATING HOLOGRAPHIC DISPLAY...', delay: 1200 },
  { text: 'ACCESSING STAR MAP DATABASE...', delay: 1600 },
  { text: 'SYNCHRONIZING SECTOR WAYPOINTS...', delay: 2000 },
  { text: 'SYSTEM READY.', delay: 2400, type: 'success' },
];

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    bootLines.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, line.delay);
      timers.push(timer);
    });

    // Complete boot sequence after all lines
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 800);
    }, 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="boot-sequence"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="boot-terminal">
            <div className="boot-header">
              <span className="boot-icon">◈</span>
              <span className="boot-title">LEON MISSION CONTROL v2.0</span>
            </div>

            <div className="boot-content">
              {bootLines.map((line, index) => (
                <motion.div
                  key={index}
                  className={`boot-line ${line.type || ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: visibleLines.includes(index) ? 1 : 0,
                    x: visibleLines.includes(index) ? 0 : -20
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="line-prefix">
                    [{String(index + 1).padStart(2, '0')}]
                  </span>
                  <span className="line-text">{line.text}</span>
                  {visibleLines.includes(index) && line.type !== 'success' && (
                    <span className="line-cursor">_</span>
                  )}
                  {line.type === 'success' && (
                    <span className="success-check">✓</span>
                  )}
                </motion.div>
              ))}

              {visibleLines.includes(bootLines.length - 1) && (
                <motion.div
                  className="boot-progress"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="progress-bar" />
                </motion.div>
              )}
            </div>

            <div className="boot-footer">
              <span className="footer-text">AUTOMATED SEQUENCE COMPLETE</span>
              <span className="footer-version">BUILD: 2026.02.13</span>
            </div>
          </div>

          {/* Scanline effect */}
          <div className="scanlines" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootSequence;
