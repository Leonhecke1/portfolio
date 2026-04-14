import { motion } from 'framer-motion';
import { Monitor, Server, Wrench, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fadeUp, stagger, viewport } from '../lib/motion';
import StatusWidget from './StatusWidget';

const skillCategories = [
  {
    label: 'Frontend',
    icon: Monitor,
    color: 'rgba(59,130,246,0.9)',
    glow: 'rgba(59,130,246,0.12)',
    glowHover: 'rgba(59,130,246,0.18)',
    border: 'rgba(96,165,250,0.2)',
    skills: ['React', 'TypeScript', 'JavaScript', 'SCSS / CSS', 'Tailwind CSS'],
  },
  {
    label: 'Backend',
    icon: Server,
    color: 'rgba(167,139,250,0.9)',
    glow: 'rgba(124,58,237,0.12)',
    glowHover: 'rgba(124,58,237,0.18)',
    border: 'rgba(167,139,250,0.2)',
    skills: ['Node.js', 'Express.js', 'REST APIs', 'Shopware'],
  },
  {
    label: 'Tooling',
    icon: Wrench,
    color: 'rgba(52,211,153,0.9)',
    glow: 'rgba(16,185,129,0.1)',
    glowHover: 'rgba(16,185,129,0.16)',
    border: 'rgba(52,211,153,0.2)',
    skills: ['Git', 'Vite', 'Scrum / Agile', 'SEO'],
  },
  {
    label: 'Visual',
    icon: Sparkles,
    color: 'rgba(251,191,36,0.9)',
    glow: 'rgba(245,158,11,0.08)',
    glowHover: 'rgba(245,158,11,0.14)',
    border: 'rgba(251,191,36,0.2)',
    skills: ['Three.js', 'Framer Motion', 'Figma', 'Accessibility'],
  },
];

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 7rem) clamp(1rem, 4vw, 1.5rem)' }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '-8%', top: '40%',
        width: '500px', height: '500px', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', color: 'rgba(96,165,250,0.8)',
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            Get to know me
          </p>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EEF2FF',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            {t('about.title')}
          </h2>
        </motion.div>

        {/* Two-column: bio + skills */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 items-start"
          style={{ gap: 'clamp(2.5rem, 6vw, 4.5rem)' }}
        >

          {/* ── Bio column ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <motion.p variants={fadeUp} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1.0625rem', lineHeight: 1.8,
              color: 'rgba(139,150,170,0.9)',
            }}>
              {t('about.paragraph1')}
            </motion.p>

            <motion.p variants={fadeUp} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1.0625rem', lineHeight: 1.8,
              color: 'rgba(139,150,170,0.9)',
            }}>
              {t('about.paragraph2')}
            </motion.p>

            {/* Languages */}
            <motion.div variants={fadeUp} style={{ paddingTop: '1rem' }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px', color: 'rgba(61,77,96,0.9)',
                letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.875rem',
              }}>
                {t('about.languagesTitle')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[t('about.german'), t('about.english')].map(lang => (
                  <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'rgba(96,165,250,0.5)', flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px', color: 'rgba(203,213,225,0.85)',
                    }}>
                      {lang}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Status widget */}
            <StatusWidget />
          </motion.div>

          {/* ── Skills column ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="grid grid-cols-2"
            style={{ gap: '0.75rem' }}
          >
            {skillCategories.map(({ label, icon: Icon, color, glow, glowHover, border, skills }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                style={{
                  padding: 'clamp(0.875rem, 2vw, 1.25rem)',
                  borderRadius: '16px',
                  background: glow,
                  border: `1px solid ${border}`,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = glowHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = glow; }}
              >
                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <Icon size={14} color={color} />
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px', color, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {label}
                  </span>
                </div>

                {/* Skill list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {skills.map(skill => (
                    <span key={skill} style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12.5px', color: 'rgba(203,213,225,0.75)',
                      lineHeight: 1.5,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
