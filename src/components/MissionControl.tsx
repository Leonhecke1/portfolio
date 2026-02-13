import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import StarMap from './StarMap';
import HUD from './HUD';
import BootSequence from './BootSequence';
import { useTheme } from '../contexts/MissionControlContext';
import './MissionControl.css';

// Content panels for each sector
const SectorContent: React.FC = () => {
  const { activeSector } = useTheme();

  const content = {
    home: {
      title: 'MISSION CONTROL',
      subtitle: 'Welcome to the Starbase',
      description: 'Navigate through the constellation to explore my portfolio. Use the navigation dock below to explore different sectors.',
    },
    about: {
      title: 'PERSONNEL FILE',
      subtitle: 'Leon Hecke',
      description: 'Full Stack Developer specializing in React, Three.js, and immersive web experiences.',
    },
    projects: {
      title: 'MISSION LOGS',
      subtitle: 'Featured Projects',
      description: 'Explore my completed missions and ongoing operations.',
    },
    contact: {
      title: 'COMMS LINK',
      subtitle: 'Establish Connection',
      description: 'Ready to collaborate? Send a transmission.',
    },
  };

  const currentContent = content[activeSector as keyof typeof content] || content.home;

  return (
    <div className="sector-content">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSector}
          className="content-panel"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="panel-header">
            <span className="panel-icon">◈</span>
            <span className="panel-title">{currentContent.title}</span>
          </div>
          <div className="panel-body">
            <h2 className="content-title">{currentContent.subtitle}</h2>
            <p className="content-description">{currentContent.description}</p>

          {activeSector === 'projects' && (
            <div className="projects-grid">
              <div className="project-card">
                <div className="project-icon">◇</div>
                <h3>Planetary Dashboard</h3>
                <p>Interactive 3D solar system with NASA data</p>
                <div className="project-tech">
                  <span>React</span>
                  <span>Three.js</span>
                  <span>API</span>
                </div>
              </div>
              <div className="project-card">
                <div className="project-icon">◆</div>
                <h3>Project Delta</h3>
                <p>Drag-and-drop interface builder</p>
                <div className="project-tech">
                  <span>React</span>
                  <span>TypeScript</span>
                  <span>DnD</span>
                </div>
              </div>
              <div className="project-card">
                <div className="project-icon">◈</div>
                <h3>Space Portfolio</h3>
                <p>This very mission control interface</p>
                <div className="project-tech">
                  <span>React</span>
                  <span>WebGL</span>
                  <span>R3F</span>
                </div>
              </div>
            </div>
          )}

          {activeSector === 'contact' && (
            <div className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="TRANSMISSION SOURCE" />
              </div>
              <div className="form-group">
                <input type="email" placeholder="FREQUENCY (EMAIL)" />
              </div>
              <div className="form-group">
                <textarea placeholder="MESSAGE CONTENT" rows={4}></textarea>
              </div>
              <button className="transmit-btn">INITIATE TRANSMISSION</button>
            </div>
          )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="loading-fallback">
    <div className="loading-spinner"></div>
    <span>INITIALIZING SECTOR...</span>
  </div>
);

// Main Mission Control wrapper
const MissionControl: React.FC = () => {
  const { isBooting, setIsBooting, activeSector } = useTheme();

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  return (
    <div className="mission-control" data-sector={activeSector}>
      {/* Boot Sequence */}
      <BootSequence onComplete={handleBootComplete} />

      {/* 3D Canvas */}
      <div className="canvas-wrapper">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <StarMap />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>

      {/* HUD Overlay */}
      {!isBooting && (
        <>
          <HUD />
          <SectorContent />
        </>
      )}
    </div>
  );
};

export default MissionControl;
