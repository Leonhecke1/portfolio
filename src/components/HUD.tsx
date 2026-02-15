import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, THEME } from '../contexts/MissionControlContext';
import './HUD.css';

// Floating System Status - Far Top Left
const SystemStatus: React.FC = () => {
  const [ping, setPing] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => Math.max(8, Math.min(45, prev + Math.floor(Math.random() * 10) - 5)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="system-status-floating"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="status-row">
        <span className="status-indicator" style={{ background: THEME.teal }} />
        <span className="status-text">ONLINE</span>
      </div>
      <div className="status-row">
        <span className="status-value">{ping}ms</span>
        <span className="status-label">LATENCY</span>
      </div>
    </motion.div>
  );
};

// Floating Mission Log - Far Top Right
const MissionLog: React.FC = () => {
  const { activeSector } = useTheme();
  const [lines, setLines] = useState<string[]>([]);

  const sectorData: Record<string, string[]> = {
    home: [
      '> WELCOME TO MISSION CONTROL',
      '> SELECT A SECTOR TO EXPLORE',
      '> DRAG TO ROTATE',
    ],
    about: [
      '> ACCESSING PERSONNEL FILE...',
      '> LEON HECKE',
      '> FULL STACK DEVELOPER',
    ],
    projects: [
      '> LOADING MISSION LOGS...',
      '> PLANETARY DASHBOARD',
      '> PROJECT DELTA',
    ],
    contact: [
      '> COMMS CHANNEL READY',
      '> READY FOR TRANSMISSION',
    ],
  };

  useEffect(() => {
    setLines([]);
    const data = sectorData[activeSector] || sectorData.home;
    let index = 0;
    const interval = setInterval(() => {
      if (index < data.length) {
        setLines(prev => [...prev, data[index]]);
        index++;
      }
    }, 250);
    return () => clearInterval(interval);
  }, [activeSector]);

  return (
    <motion.div
      className="mission-log-floating"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <div className="log-terminal">
        {lines.map((line, i) => (
          <motion.div
            key={`${activeSector}-${i}`}
            className="log-line"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {line}
          </motion.div>
        ))}
        <span className="log-cursor">_</span>
      </div>
    </motion.div>
  );
};

// Floating Island Dock - Bottom Center with magnetic hover
const SectorDock: React.FC = () => {
  const { activeSector, setActiveSector, isFocused, setIsFocused } = useTheme();

  const sectors = [
    { id: 'home', label: 'Home', icon: '◈' },
    { id: 'about', label: 'About', icon: '◇' },
    { id: 'projects', label: 'Projects', icon: '◆' },
    { id: 'contact', label: 'Contact', icon: '○' },
  ];

  const handleSectorChange = (sectorId: string) => {
    if (sectorId !== activeSector && !isFocused) {
      // Phase 1: Start transition (0ms)
      setIsFocused(true);

      // Phase 2: Change sector midway through (750ms)
      setTimeout(() => {
        setActiveSector(sectorId);
      }, 750);

      // Phase 3: End transition (1500ms)
      setTimeout(() => {
        setIsFocused(false);
      }, 1500);
    }
  };

  return (
    <motion.div
      className="sector-dock"
      initial={{ opacity: 0, y: 40 }}
      animate={{
        y: isFocused ? 50 : 0,
        opacity: isFocused ? 0.1 : 1,
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="dock-inner">
        {sectors.map((sector) => (
          <motion.button
            key={sector.id}
            className={`dock-item ${activeSector === sector.id ? 'active' : ''}`}
            onClick={() => handleSectorChange(sector.id)}
            whileHover={{
              scale: 1.2,
              y: -10,
              transition: { type: 'spring', stiffness: 400, damping: 15 },
            }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="dock-icon" style={{
              color: activeSector === sector.id ? THEME.sandGold : THEME.textSecondary,
              textShadow: activeSector === sector.id ? THEME.glowGold : 'none',
            }}>
              {sector.icon}
            </span>
            <span className="dock-label">{sector.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Clock - Top Center
const MissionClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="clock-floating"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <span className="clock-time">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
    </motion.div>
  );
};

// Corner Accent - L-shaped thin lines
const CornerAccent: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ position }) => {
  return (
    <div className={`corner-accent corner-${position}`}>
      <svg viewBox="0 0 60 60" preserveAspectRatio="none">
        {position === 'tl' && (
          <path d="M0,60 L0,0 L60,0" fill="none" stroke={THEME.teal} strokeWidth="1" opacity="0.5" />
        )}
        {position === 'tr' && (
          <path d="M0,0 L60,0 L60,60" fill="none" stroke={THEME.teal} strokeWidth="1" opacity="0.5" />
        )}
        {position === 'bl' && (
          <path d="M0,0 L0,60 L60,60" fill="none" stroke={THEME.teal} strokeWidth="1" opacity="0.5" />
        )}
        {position === 'br' && (
          <path d="M60,0 L60,60 L0,60" fill="none" stroke={THEME.teal} strokeWidth="1" opacity="0.5" />
        )}
      </svg>
    </div>
  );
};

// Main HUD
const HUD: React.FC = () => {
  const { isBooting, warpFactor, isFocused } = useTheme();

  return (
    <AnimatePresence>
      {!isBooting && (
        <motion.div
          className={`hud-container ${warpFactor > 0 ? 'warping' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Corner Accents */}
          <CornerAccent position="tl" />
          <CornerAccent position="tr" />
          <CornerAccent position="bl" />
          <CornerAccent position="br" />

          {/* Top Left - System Status */}
          <motion.div
            className="hud-top-left"
            animate={{ opacity: isFocused ? 0.1 : 1, x: isFocused ? -50 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <SystemStatus />
          </motion.div>

          {/* Top Center - Clock */}
          <motion.div
            className="hud-top-center"
            animate={{ opacity: isFocused ? 0.1 : 1, y: isFocused ? -50 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <MissionClock />
          </motion.div>

          {/* Top Right - Mission Log */}
          <motion.div
            className="hud-top-right"
            animate={{ opacity: isFocused ? 0.1 : 1, x: isFocused ? 50 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <MissionLog />
          </motion.div>

          {/* Bottom - Floating Dock */}
          <div className="hud-bottom-center">
            <SectorDock />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HUD;
