import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useVisualMode } from '../contexts/VisualModeContext';

const LINKS = [
  { label_en: 'Home',         label_de: 'Start',        id: 'hero'                  },
  { label_en: 'About',        label_de: 'Über mich',    id: 'about'                 },
  { label_en: 'Capabilities', label_de: 'Skills',       id: 'capabilities'          },
  { label_en: 'Timeline',     label_de: 'Werdegang',    id: 'spacestation-timeline' },
  { label_en: 'Projects',     label_de: 'Projekte',     id: 'projects'              },
  { label_en: 'Lab',          label_de: 'Lab',          id: 'lab'                   },
  { label_en: 'Contact',      label_de: 'Kontakt',      id: 'contact'               },
];

const SECTION_IDS = ['hero', 'about', 'capabilities', 'spacestation-timeline', 'projects', 'lab', 'contact'];

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { isMenuOpen, toggleMenu }  = useNavigation();
  const { enhanced, toggle: toggleMode } = useVisualMode();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('hero');
  const _ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (_ticking.current) return;
    _ticking.current = true;
    requestAnimationFrame(() => {
      _ticking.current = false;
      setScrolled(window.scrollY > 20);
      const mid = window.scrollY + window.innerHeight * 0.38;
      let cur = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= mid) cur = id;
      }
      setActiveId(cur);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (isMenuOpen) toggleMenu();
  };

  const activeLink = LINKS.find(l => l.id === activeId) ?? null;

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background 0.4s, border-color 0.4s',
      background: scrolled ? 'rgba(7,10,18,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
    }}>
      {/* ── Main bar ────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 1.5rem)', height: '62px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <button
          onClick={() => scrollTo('hero')}
          style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '15px',
            color: '#EEF2FF', background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.2s', letterSpacing: '-0.01em', padding: '8px 0',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue-l)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2FF'; }}
        >
          <span style={{ color: 'rgba(96,165,250,0.75)' }}>&lt;</span>
          LH
          <span style={{ color: 'rgba(96,165,250,0.75)' }}> /&gt;</span>
        </button>

        {/* Desktop links — hidden below lg via CSS class only (no inline display) */}
        <ul className="hidden lg:flex" style={{
          gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0,
          alignItems: 'center',
        }}>
          {LINKS.map(({ label_en, label_de, id }) => {
            const isActive = activeLink?.id === id;
            const label    = language === 'de' ? label_de : label_en;
            return (
              <li key={id} style={{ position: 'relative' }}>
                <button
                  onClick={() => scrollTo(id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 0',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px',
                    color: isActive ? '#EEF2FF' : 'rgba(139,150,170,0.9)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2FF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isActive ? '#EEF2FF' : 'rgba(139,150,170,0.9)'; }}
                >
                  {label}
                </button>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    style={{
                      position: 'absolute', bottom: '-2px', left: 0, right: 0,
                      height: '1.5px',
                      background: 'linear-gradient(to right, var(--blue), var(--purple))',
                      borderRadius: '2px',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

          {/* Language toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '999px', padding: '3px',
          }}>
            {(['en', 'de'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                  padding: '4px 8px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  transition: 'all 0.2s',
                  background: language === lang ? 'rgba(59,130,246,0.22)' : 'transparent',
                  color:      language === lang ? '#93C5FD' : 'rgba(100,116,139,0.8)',
                  fontWeight: language === lang ? 500 : 400,
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Visual mode toggle — desktop only */}
          <motion.button
            onClick={toggleMode}
            title={enhanced ? 'Disable enhanced visuals' : 'Enable enhanced visuals'}
            className="hidden lg:flex"
            animate={enhanced ? 'on' : 'off'}
            whileHover="hover"
            variants={{
              off:   { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
              on:    { background: 'rgba(124,58,237,0.12)',  borderColor: 'rgba(167,139,250,0.3)'  },
              hover: { background: 'rgba(124,58,237,0.16)',  borderColor: 'rgba(167,139,250,0.4)'  },
            }}
            style={{
              alignItems: 'center', gap: '5px',
              padding: '5px 10px 5px 7px',
              borderRadius: '999px',
              border: '1px solid',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s',
              boxShadow: enhanced ? '0 0 14px rgba(124,58,237,0.25)' : 'none',
            }}
          >
            <motion.span
              animate={{ rotate: enhanced ? 360 : 0, color: enhanced ? 'rgba(196,181,253,0.9)' : 'rgba(100,116,139,0.6)' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ display: 'flex' }}
            >
              <Sparkles size={13} />
            </motion.span>
            <motion.span
              animate={{ color: enhanced ? 'rgba(196,181,253,0.9)' : 'rgba(100,116,139,0.6)' }}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.06em' }}
            >
              {enhanced ? 'ON' : 'OFF'}
            </motion.span>
          </motion.button>

          {/* Hamburger — below lg only */}
          <button
            onClick={toggleMenu}
            className="lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: isMenuOpen ? '#EEF2FF' : 'rgba(139,150,170,0.9)',
              padding: '8px',
              transition: 'color 0.2s',
              /* No display property — Tailwind md:hidden controls visibility */
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isMenuOpen ? '#EEF2FF' : 'rgba(139,150,170,0.9)'; }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen
                ? <motion.span key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'block' }}
                  ><X size={20} /></motion.span>
                : <motion.span key="open"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'block' }}
                  ><Menu size={20} /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer — below lg only ───── */}
      <div className="lg:hidden">
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: 'rgba(7,10,18,0.97)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '0.5rem clamp(1rem, 4vw, 1.5rem) 1.25rem',
              }}>
                {/* Nav links */}
                {LINKS.map(({ label_en, label_de, id }) => {
                  const isActive = activeLink?.id === id;
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 600,
                        color: isActive ? '#EEF2FF' : 'rgba(139,150,170,0.8)',
                        padding: '0.875rem 0',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'color 0.2s',
                      }}
                      onTouchStart={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2FF'; }}
                      onTouchEnd={e => { (e.currentTarget as HTMLElement).style.color = isActive ? '#EEF2FF' : 'rgba(139,150,170,0.8)'; }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2FF'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isActive ? '#EEF2FF' : 'rgba(139,150,170,0.8)'; }}
                    >
                      {language === 'de' ? label_de : label_en}
                      {isActive && (
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: 'var(--blue)', flexShrink: 0,
                        }} />
                      )}
                    </button>
                  );
                })}

                {/* Visual mode toggle — mobile */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 0', marginTop: '0.25rem',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                    color: 'rgba(100,116,139,0.7)',
                  }}>
                    <Sparkles size={13} color={enhanced ? 'rgba(167,139,250,0.8)' : 'rgba(100,116,139,0.5)'} />
                    Enhanced visuals
                  </span>
                  <button
                    onClick={toggleMode}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px 4px 8px',
                      borderRadius: '999px',
                      border: `1px solid ${enhanced ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      background: enhanced ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                      color: enhanced ? 'rgba(196,181,253,0.9)' : 'rgba(100,116,139,0.6)',
                      boxShadow: enhanced ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Sparkles size={11} />
                    {enhanced ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
