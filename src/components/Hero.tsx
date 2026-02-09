import React from 'react';
import AstronautSvg from '../assets/astronaut-astronomy-galaxy-svgrepo-com.svg?react'; // Import the new detailed astronaut SVG as a component
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage hook

const Hero: React.FC = () => {
  const { t } = useLanguage(); // Use the language context

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h2 className="hero-title">{t('hero.greeting')} {t('hero.name')}!</h2>
        <p className="hero-subtitle">{t('hero.tagline')}</p>
        <a href="#projects" className="btn-custom">{t('nav.projects')}</a> {/* Using existing translation for 'Projects' */}
      </div>
      <AstronautSvg className="hero-astronaut-img" /> {/* Use the astronaut SVG component */}
    </section>
  );
};

export default Hero;
