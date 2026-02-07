import React from 'react';
import AstronautSvg from '../assets/astronaut-astronomy-galaxy-svgrepo-com.svg?react'; // Import the new detailed astronaut SVG as a component

const Hero: React.FC = () => {

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h2 className="hero-title">Greetings, Explorer!</h2>
        <p className="hero-subtitle">Ich mag viel bir</p>
        <a href="#projects" className="btn-custom">View My Work</a>
      </div>
      <AstronautSvg className="hero-astronaut-img" /> {/* Use the astronaut SVG component */}
    </section>
  );
};

export default Hero;
