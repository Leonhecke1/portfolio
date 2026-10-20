import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, type Language } from '../contexts/LanguageContext';

const LANGUAGES: Language[] = ['de', 'en'];

const Header: React.FC = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const onHome = location.pathname === '/';

  // On the home page the anchors scroll in place; elsewhere they route home first.
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!onHome) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">{t('nav.skip')}</a>
      <Link to="/" className="site-mark" aria-label={t('nav.home')}>Leon Hecke</Link>
      <nav className="site-nav" aria-label={t('nav.label')}>
        <Link to="/#schritt-2" onClick={(e) => scrollTo(e, 'schritt-2')}>{t('nav.projects')}</Link>
        <Link to="/#schritt-1" onClick={(e) => scrollTo(e, 'schritt-1')}>{t('nav.career')}</Link>
        <Link to="/#kontakt" onClick={(e) => scrollTo(e, 'kontakt')}>{t('nav.contact')}</Link>
      </nav>
      <div className="lang" role="group" aria-label={t('language.switch')}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            aria-pressed={language === lang}
            onClick={() => setLanguage(lang)}
            lang={lang}
            aria-label={t(`language.${lang}`)}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
