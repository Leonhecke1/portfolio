import React, { useId, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CONTACT_EMAIL } from '../buildData';

type Status = 'idle' | 'missing' | 'opened';

// There is no mail backend: the form composes a mailto link when an address is configured, and says so plainly when not.
const ContactForm: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');
  const offline = !CONTACT_EMAIL;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    if (!name || !email || !message) {
      setStatus('missing');
      return;
    }
    const subject = encodeURIComponent(`Portfolio · ${name}`);
    const body = encodeURIComponent(`${message}\n\n${name} <${email}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus('opened');
  };

  return (
    <form className={`contact-form${compact ? ' contact-form--compact' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor={`${id}-name`}>{t('contact.nameLabel')}</label>
        <input id={`${id}-name`} name="name" type="text" autoComplete="name" disabled={offline} />
      </div>
      <div className="form-row">
        <label htmlFor={`${id}-email`}>{t('contact.emailLabel')}</label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" disabled={offline} />
      </div>
      <div className="form-row">
        <label htmlFor={`${id}-message`}>{t('contact.messageLabel')}</label>
        <textarea id={`${id}-message`} name="message" rows={compact ? 4 : 6} disabled={offline} />
      </div>
      <div className="form-foot">
        <button type="submit" className="btn" disabled={offline}>
          {t('contact.submitButton')}
        </button>
        <p className="form-status" role="status">
          {offline && t('contact.offline')}
          {!offline && status === 'missing' && t('contact.required')}
          {!offline && status === 'opened' && t('contact.opened')}
        </p>
      </div>
    </form>
  );
};

export default ContactForm;
