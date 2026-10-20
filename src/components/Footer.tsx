import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Leon Hecke</p>
      <p>{t('footer.edition')}</p>
    </footer>
  );
};

export default Footer;
