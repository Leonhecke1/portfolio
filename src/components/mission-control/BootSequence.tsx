import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, THEME } from '../../contexts/MissionControlContext';
import './BootSequence.css';

interface BootStep {
  id: string;
  text: string;
  duration: number;
}

const bootSequence: BootStep[] = [
  { id: 'init', text: 'INITIALIZING MISSION CONTROL...', duration: 400 },
  { id: 'gpu', text: '[OK] GPU RENDERER: THREE.JS ENGINE', duration: 300 },
  { id: 'webgl', text: '[OK] WEBGL CONTEXT: ACTIVE', duration: 300 },
  { id: 'audio', text: '[OK] AUDIO SUBSYSTEM: STANDBY', duration: 250 },
  { id: 'nav', text: '[OK] NAVIGATION MATRIX: LOADED', duration: 250 },
  { id: 'security', text: '[OK] SECURITY PROTOCOL: ENABLED', duration: 250 },
  { id: 'neural', text: '[OK] NEURAL INTERFACE: ONLINE', duration: 300 },
  { id: 'sector', text: '[OK] SECTOR MAP: CALIBRATING', duration: 350 },
  { id: 'warp', text: '[OK] WARP DRIVE: READY', duration: 300 },
  { id: 'welcome', text: '// MISSION CONTROL ONLINE', duration: 500 },
];

const BootSequence: React.FC = () => {
  const { setIsBooting, setShowTerminal } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 400);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentStep >= bootSequence.length) {
      // Boot complete - show terminal briefly then hide
      setTimeout(() => {
        setIsBooting(false);
      }, 800);
      return;
    }

    const step = bootSequence[currentStep];
    let charIndex = 0;

    // Typing effect
    const typeInterval = setInterval(() => {
      if (charIndex <= step.text.length) {
        setDisplayedText(step.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        // Wait before next step
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setIsTyping(true);
        }, step.duration);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentStep, setIsBooting]);

  const handleSkip = useCallback(() => {
    setIsBooting(false);
  }, [setIsBooting]);

  return (
    <AnimatePresence>
      <motion.div
        className="boot-sequence"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {/* Scanlines overlay */}
        <div className="boot-scanlines" />

        {/* Terminal window */}
        <div className="boot-terminal">
          <div className="terminal-header">
            <div className="terminal-buttons">
              <span className="btn-close" />
              <span className="btn-minimize" />
              <span className="btn-maximize" />
            </div>
            <span className="terminal-title">MISSION_CONTROL v2.047 // BOOT_SEQUENCE</span>
          </div>

          <div className="terminal-body">
            <div className="terminal-output">
              {bootSequence.slice(0, currentStep).map((step, index) => (
                <div key={step.id} className="terminal-line completed">
                  <span className="timestamp">
                    [{String(index * 0.1).padStart(4, '0')}]
                  </span>
                  <span className="line-text">{step.text}</span>
                </div>
              ))}
              <div className="terminal-line active">
                <span className="timestamp">
                  [{String(currentStep * 0.1).padStart(4, '0')}]
                </span>
                <span className="line-text">
                  {displayedText}
                  {isTyping && <span className="typing-cursor">_</span>}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: `${(currentStep / bootSequence.length) * 100}%`,
                }}
              />
              <span className="progress-text">
                {Math.round((currentStep / bootSequence.length) * 100)}% COMPLETE
              </span>
            </div>
          </div>

          {/* Skip button */}
          <button className="skip-button" onClick={handleSkip}>
            [SKIP] &gt;&gt;
          </button>
        </div>

        {/* Corner decorations */}
        <div className="corner top-left" />
        <div className="corner top-right" />
        <div className="corner bottom-left" />
        <div className="corner bottom-right" />
      </motion.div>
    </AnimatePresence>
  );
};

export default BootSequence;
