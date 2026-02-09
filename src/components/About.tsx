import React from 'react';
import EarthGlobeSvg from '../assets/astronomy-earth-globe-svgrepo-com.svg?react'; // Import the Earth globe SVG as a component
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage hook

const About: React.FC = () => {
  const { t } = useLanguage(); // Use the language context

  return (
    <section id="about" className="about-section">
      <div className="parallax-background"></div> {/* Parallax background layer */}
      <div className="section-container">
        <h2 className="section-title">{t('about.title')}</h2> {/* Translated title */}
        <EarthGlobeSvg className="about-globe-img" /> {/* Use the Earth globe SVG component */}
        <p className="about-text">
          {t('about.paragraph1')} {/* Translated paragraph */}
        </p>
        <p className="about-text">
          {t('about.paragraph2')} {/* Translated paragraph */}
        </p>

        <div className="about-content-grid">
          <div className="skills-container">
            <h3 className="section-subtitle">{t('about.skillsTitle')}</h3> {/* Translated subtitle */}
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
            <h3 className="section-subtitle">{t('about.languagesTitle')}</h3> {/* Translated subtitle */}
            <ul className="languages-list">
              <li>{t('about.german')}</li>
              <li>{t('about.english')}</li>
            </ul>
          </div>

          <div className="career-path-container skills-container"> {/* Reusing skills-container styling for consistency */}
            <h3 className="section-subtitle">{t('about.careerPathTitle')}</h3>
            <p className="career-entry-text">{t('career.entry1')}</p>
            <p className="career-entry-text">{t('career.entry2')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;