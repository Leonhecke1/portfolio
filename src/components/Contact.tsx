import React from 'react';
import SatelliteSvg from '../assets/astronomy-satellite-space-svgrepo-com.svg?react'; // Import the satellite SVG as a component
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage hook

const Contact: React.FC = () => {
  const { t } = useLanguage(); // Use the language context

  return (
    <section id="contact" className="contact-section">
      <div className="section-container">
        <h2 className="section-title">{t('contact.title')}</h2> {/* Translated title */}
        <SatelliteSvg className="contact-satellite-img" /> {/* Use the satellite SVG component */}
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">{t('contact.nameLabel')}</label> {/* Translated label */}
            <input type="text" className="form-input" id="name" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('contact.emailLabel')}</label> {/* Translated label */}
            <input type="email" className="form-input" id="email" />
          </div>
          <div className="form-group">
            <label htmlFor="message" className="form-label">{t('contact.messageLabel')}</label> {/* Translated label */}
            <textarea className="form-textarea" id="message" rows={5}></textarea>
          </div>
          <button type="submit" className="btn-custom">{t('contact.submitButton')}</button> {/* Translated button text */}
        </form>
      </div>
    </section>
  );
};

export default Contact;