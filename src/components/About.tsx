import React from 'react';
import EarthGlobeSvg from '../assets/astronomy-earth-globe-svgrepo-com.svg?react'; // Import the Earth globe SVG as a component

const About: React.FC = () => {
  return (
    <section id="about" className="about-section">
      <div className="parallax-background"></div> {/* Parallax background layer */}
      <div className="section-container">
        <h2 className="section-title">Über Mich</h2>
        <EarthGlobeSvg className="about-globe-img" /> {/* Use the Earth globe SVG component */}
        <p className="about-text">
          Als engagierter Frontend-Entwickler mit einer Leidenschaft für moderne Webtechnologien bringe ich fundierte Kenntnisse in React, TypeScript und JavaScript mit. Meine Expertise umfasst die Konzeption, Entwicklung und Wartung von interaktiven Webanwendungen und Shopware-Shops.
        </p>
        <p className="about-text">
          Ich lege großen Wert auf Performance-Optimierung, Benutzerfreundlichkeit und Barrierefreiheit. Mit agilen Methoden wie Scrum und einem Auge für Details schaffe ich effiziente und skalierbare Lösungen.
        </p>

        <div className="about-content-grid">
          <div className="skills-container">
            <h3 className="section-subtitle">Qualifikationen:</h3>
            <ul className="skills-list">
              <li>React</li>
              <li>JavaScript</li>
              <li>TypeScript</li>
              <li>Node.js</li>
              <li>Scrum</li>
              <li>HTML / CSS</li>
              <li>Bootstrap</li>
              <li>Playwright</li>
              <li>Jest</li>
              <li>Twig</li>
            </ul>
          </div>

          <div className="languages-container">
            <h3 className="section-subtitle">Sprachen:</h3>
            <ul className="languages-list">
              <li>Deutsch (Muttersprache)</li>
              <li>Englisch (B2)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;