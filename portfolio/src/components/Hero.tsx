import React from 'react';

const Hero: React.FC = () => {

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h2 className="hero-title">Greetings, Explorer!</h2>
        <p className="hero-subtitle">I am [Your Name], a software engineer navigating the cosmos of code.</p>
        <a href="#projects" className="btn-custom">View My Work</a>
      </div>
    </section>
  );
};

export default Hero;