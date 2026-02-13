import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, THEME } from '../contexts/MissionControlContext';
import './MissionHUD.css';

// Animated SVG scanning line
const ScanningLine: React.FC = () => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="scanning-line" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line
        x1="0"
        y1={position}
        x2="100"
        y2={position}
        stroke={THEME.neonCyan}
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
};

// Radar pulse effect
const RadarPulse: React.FC = () => {
  return (
    <div className="radar-container">
      <div className="radar">
        <div className="radar-sweep"></div>
        <div className="radar-ring ring-1"></div>
        <div className="radar-ring ring-2"></div>
        <div className="radar-ring ring-3"></div>
        <div className="radar-center"></div>
      </div>
    </div>
  );
};

// System status indicators
const SystemStatus: React.FC = () => {
  const [ping, setPing] = useState(12);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => Math.max(8, Math.min(45, prev + Math.floor(Math.random() * 10) - 5)));
      setFps(prev => Math.max(55, Math.min(60, prev + Math.floor(Math.random() * 5) - 2)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="system-status">
      <div className="status-header">
        <span className="status-icon">◆</span>
        <span>SYSTEM STATUS</span>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">PING</span>
          <span className="status-value">{ping}ms</span>
          <div className="status-bar">
            <div className="status-fill" style={{ width: `${100 - ping * 2}%` }}></div>
          </div>
        </div>

        <div className="status-item">
          <span className="status-label">FPS</span>
          <span className="status-value">{fps}</span>
          <div className="status-bar">
            <div className="status-fill fps" style={{ width: `${fps / 60 * 100}%` }}></div>
          </div>
        </div>

        <div className="status-item">
          <span className="status-label">WEBGL</span>
          <span className="status-value active">ACTIVE</span>
        </div>

        <div className="status-item">
          <span className="status-label">RENDER</span>
          <span className="status-value">60Hz</span>
        </div>
      </div>
    </div>
  );
};

// Tech stack indicators
const TechRadar: React.FC = () => {
  const technologies = [
    { name: 'React', level: 95 },
    { name: 'Three.js', level: 85 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 88 },
    { name: 'Python', level: 75 },
  ];

  return (
    <div className="tech-radar">
      <div className="radar-header">
        <span className="radar-icon">◉</span>
        <span>TECH MATRIX</span>
      </div>

      <div className="tech-grid">
        {technologies.map((tech, index) => (
          <div key={index} className="tech-item">
            <div className="tech-info">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-level">{tech.level}%</span>
            </div>
            <div className="tech-bar">
              <motion.div
                className="tech-fill"
                initial={{ width: 0 }}
                animate={{ width: `${tech.level}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mission Log (Terminal style content)
const MissionLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const messages = [
    '// Leon Hecke - Full Stack Developer',
    '// Specializing in React, Three.js, WebGL',
    '// Creating immersive web experiences',
    '// Based in Germany',
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setLogs(prev => [...prev, messages[index]]);
        index++;
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mission-log">
      <div className="log-header">
        <span className="log-icon">▶</span>
        <span>MISSION LOG</span>
      </div>

      <div className="log-content">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            className="log-line"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="log-prefix">[{String(index + 1).padStart(2, '0')}]</span>
            <span className="log-text">{log}</span>
          </motion.div>
        ))}
        <span className="log-cursor">_</span>
      </div>
    </div>
  );
};

// Sector Navigator
const SectorNavigator: React.FC = () => {
  const { activeSector, setActiveSector, setWarpFactor } = useTheme();

  const sectors = [
    { id: 'home', label: 'HOME', icon: '◈' },
    { id: 'about', label: 'ABOUT', icon: '◇' },
    { id: 'projects', label: 'PROJECTS', icon: '◆' },
    { id: 'contact', label: 'CONTACT', icon: '○' },
  ];

  const handleSectorChange = (sectorId: string) => {
    if (sectorId !== activeSector) {
      // Trigger warp effect
      setWarpFactor(1);
      setTimeout(() => setWarpFactor(0), 500);
      setActiveSector(sectorId);
    }
  };

  return (
    <div className="sector-navigator">
      {sectors.map((sector, index) => (
        <motion.button
          key={sector.id}
          className={`nav-sector ${activeSector === sector.id ? 'active' : ''}`}
          onClick={() => handleSectorChange(sector.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="sector-icon">{sector.icon}</span>
          <span className="sector-label">{sector.label}</span>
          <span className="sector-index">{String(index + 1).padStart(2, '0')}</span>
        </motion.button>
      ))}
    </div>
  );
};

// Clock/Time display
const MissionClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mission-clock">
      <div className="clock-header">
        <span className="clock-icon">⏱</span>
        <span>MISSION TIME</span>
      </div>
      <div className="clock-display">
        <span className="clock-time">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="clock-date">
          {time.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

// Main HUD Component
const MissionHUD: React.FC = () => {
  const { activeSector, showTerminal } = useTheme();

  return (
    <div className="mission-hud">
      {/* Corner decorations */}
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      {/* Scanning line effect */}
      <ScanningLine />

      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-title">
          <span className="title-icon">◈</span>
          <span className="title-text">LEON HECKE</span>
          <span className="title-sub">MISSION CONTROL</span>
        </div>

        <MissionClock />
      </div>

      {/* Left panel - System Status */}
      <div className="hud-left">
        <SystemStatus />
        <TechRadar />
      </div>

      {/* Right panel - Mission Log */}
      <div className="hud-right">
        <MissionLog />
      </div>

      {/* Bottom - Sector Navigator */}
      <div className="hud-bottom">
        <SectorNavigator />
      </div>

      {/* Radar */}
      <div className="hud-radar">
        <RadarPulse />
      </div>

      {/* Active sector indicator */}
      <div className="active-sector-indicator">
        <span className="sector-label">SECTOR:</span>
        <span className="sector-name">{activeSector.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default MissionHUD;
