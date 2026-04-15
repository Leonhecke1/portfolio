import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, CheckCircle, Copy, Check, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import { fadeUp, stagger, viewport } from '../lib/motion';

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#EEF2FF',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.9375rem',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
};

const Contact = () => {
  const { t } = useLanguage();
  const { content } = useContent();
  const EMAIL = content.contact.email;
  const [form, setForm]         = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted]   = useState(false);
  const [copied, setCopied]         = useState(false);

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)';
    e.currentTarget.style.background  = 'rgba(59,130,246,0.05)';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.07)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
    e.currentTarget.style.boxShadow   = 'none';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4500);
    setForm({ name: '', email: '', message: '' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section id="contact" style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 7rem) clamp(1rem, 4vw, 1.5rem)' }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 65%)',
      }} />

      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <motion.p variants={fadeUp} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', color: 'rgba(96,165,250,0.8)',
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            Let's talk
          </motion.p>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EEF2FF',
            marginBottom: '1rem', letterSpacing: '-0.02em',
          }}>
            {t('contact.title')}
          </motion.h2>
          <motion.p variants={fadeUp} style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px', color: 'rgba(148,163,184,0.7)', lineHeight: 1.7,
            margin: 0,
          }}>
            Got a project in mind? Send a message and let's build something together.
          </motion.p>
        </motion.div>

        {/* Copy-email strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.125rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Mail size={13} color="rgba(96,165,250,0.7)" />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px', color: 'rgba(147,197,253,0.8)',
              letterSpacing: '0.04em',
            }}>
              {EMAIL}
            </span>
          </div>
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy email'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500,
              color: copied ? 'rgba(52,211,153,0.9)' : 'rgba(148,163,184,0.6)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: '6px',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              if (!copied) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1rem' }}>
            <label style={{ display: 'block' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px', color: 'rgba(100,116,139,0.8)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                display: 'block', marginBottom: '0.5rem',
              }}>
                {t('contact.nameLabel')}
              </span>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                onFocus={onFocus}
                onBlur={onBlur}
                style={inputBase}
              />
            </label>

            <label style={{ display: 'block' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px', color: 'rgba(100,116,139,0.8)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                display: 'block', marginBottom: '0.5rem',
              }}>
                {t('contact.emailLabel')}
              </span>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                onFocus={onFocus}
                onBlur={onBlur}
                style={inputBase}
              />
            </label>
          </div>

          <label style={{ display: 'block' }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px', color: 'rgba(100,116,139,0.8)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              display: 'block', marginBottom: '0.5rem',
            }}>
              {t('contact.messageLabel')}
            </span>
            <textarea
              required
              rows={6}
              placeholder="Tell me about your project…"
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              onFocus={onFocus}
              onBlur={onBlur}
              style={{ ...inputBase, resize: 'none' }}
            />
          </label>

          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14.5px',
              color: '#fff', padding: '0.875rem 1.5rem',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: submitted ? 'rgba(34,197,94,0.75)' : 'var(--blue)',
              boxShadow: submitted
                ? '0 0 24px rgba(34,197,94,0.3)'
                : '0 0 24px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => {
              if (submitted) return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = 'var(--blue-l)';
              b.style.boxShadow  = '0 0 36px rgba(59,130,246,0.55), inset 0 1px 0 rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => {
              if (submitted) return;
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = 'var(--blue)';
              b.style.boxShadow  = '0 0 24px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.07)';
            }}
          >
            {submitted
              ? <><CheckCircle size={15} /> Message sent!</>
              : <><Send size={15} /> {t('contact.submitButton')}</>}
          </button>
        </motion.form>

      </div>
    </section>
  );
};

export default Contact;
