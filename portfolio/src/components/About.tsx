import React from 'react';
import EarthGlobeSvg from '../assets/astronomy-earth-globe-svgrepo-com.svg?react'; // Import the Earth globe SVG as a component

const About: React.FC = () => {
  return (
    <section id="about" className="about-section">
      <div className="parallax-background"></div> {/* Parallax background layer */}
      <div className="section-container">
        <h2 className="section-title">About Me</h2>
        <EarthGlobeSvg className="about-globe-img" /> {/* Use the Earth globe SVG component */}
        <p className="about-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p className="about-text">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </section>
  );
};

export default About;