import React from 'react'; // Removed useState
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext'; // Import useNavigation hook

const Header: React.FC = () => {
  const { isMenuOpen, toggleMenu } = useNavigation(); // Use the navigation context
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    toggleMenu(); // Close menu on click
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeLinkClick = () => {
    toggleMenu(); // Close menu on click
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <h1 className="site-title">{t('header.title')}</h1>
        {/* Hamburger menu always visible on mobile, positioned within header-container */}
        <button
          className={`hamburger-menu ${isMenuOpen ? 'menu-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <nav className={`main-nav ${isMenuOpen ? 'menu-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={handleHomeLinkClick}>{t('nav.home')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/#about" className="nav-link" onClick={(e) => handleNavLinkClick(e, 'about')}>{t('nav.about')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/#projects" className="nav-link" onClick={(e) => handleNavLinkClick(e, 'projects')}>{t('nav.projects')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/#contact" className="nav-link" onClick={(e) => handleNavLinkClick(e, 'contact')}>{t('nav.contact')}</Link>
            </li>
          </ul>
          {/* Language selector moved inside the nav for mobile */}
          <div className="language-selector">
            <button
              className={`btn-custom ${language === 'en' ? 'active-lang' : ''}`}
              onClick={() => setLanguage('en')}
              aria-label={t('language.en')}
            >
              EN
            </button>
            <button
              className={`btn-custom ${language === 'de' ? 'active-lang' : ''}`}
              onClick={() => setLanguage('de')}
              aria-label={t('language.de')}
            >
              DE
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;