import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Briefcase, GraduationCap, Calendar, Building2 } from 'lucide-react';
import { spacestationModules } from '../spacestationData';
import { useLanguage } from '../contexts/LanguageContext';
import type { ExperienceModule, EducationModule } from '../spacestationData';
import { fadeUp, viewport } from '../lib/motion';

const itemVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const ExperienceCard = ({ module }: { module: ExperienceModule }) => (
  <div
    style={{
      padding: '1.5rem', borderRadius: '16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(4px)',
      transition: 'border-color 0.2s, background 0.2s',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = 'rgba(96,165,250,0.22)';
      el.style.background   = 'rgba(59,130,246,0.04)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = 'rgba(255,255,255,0.07)';
      el.style.background   = 'rgba(255,255,255,0.03)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
      <Calendar size={12} color="rgba(96,165,250,0.7)" />
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px', color: 'rgba(96,165,250,0.8)', letterSpacing: '0.06em',
      }}>
        {module.date}
      </span>
    </div>

    <h3 style={{
      fontFamily: "'Syne', sans-serif", fontWeight: 700,
      fontSize: '1rem', color: '#EEF2FF',
      marginBottom: '0.375rem', lineHeight: 1.3,
    }}>
      {module.title}
    </h3>

    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
      <Building2 size={11} color="rgba(148,163,184,0.5)" />
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px', color: 'rgba(148,163,184,0.75)', margin: 0,
      }}>
        {module.company}
      </p>
    </div>

    {module.description.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {module.description.map((desc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
            <div style={{
              marginTop: '7px', flexShrink: 0, width: '3px', height: '3px',
              borderRadius: '50%', background: 'rgba(59,130,246,0.45)',
            }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px', color: 'rgba(148,163,184,0.65)', lineHeight: 1.65,
            }}>
              {desc}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const EducationCard = ({ module }: { module: EducationModule }) => (
  <div
    style={{
      padding: '1.5rem', borderRadius: '16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(4px)',
      transition: 'border-color 0.2s, background 0.2s',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = 'rgba(167,139,250,0.22)';
      el.style.background   = 'rgba(124,58,237,0.04)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = 'rgba(255,255,255,0.07)';
      el.style.background   = 'rgba(255,255,255,0.03)';
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
      <Calendar size={12} color="rgba(167,139,250,0.7)" />
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px', color: 'rgba(167,139,250,0.8)', letterSpacing: '0.06em',
      }}>
        {module.date}
      </span>
    </div>

    <h3 style={{
      fontFamily: "'Syne', sans-serif", fontWeight: 700,
      fontSize: '1rem', color: '#EEF2FF',
      marginBottom: '0.375rem', lineHeight: 1.3,
    }}>
      {module.degree}
    </h3>

    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Building2 size={11} color="rgba(148,163,184,0.5)" />
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px', color: 'rgba(148,163,184,0.75)', margin: 0,
      }}>
        {module.institution}
      </p>
    </div>
  </div>
);

const SpaceStationTimeline = () => {
  const { language } = useLanguage();
  const sectionRef   = useRef<HTMLElement>(null);

  /* Scroll-driven line fill */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.9', 'end 0.4'],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const sectionTitle = language === 'de' ? 'Mein Werdegang'  : 'Career Path';
  const sectionSub   = language === 'de'
    ? 'Berufliche und akademische Stationen'
    : 'Professional & academic milestones';

  return (
    <section
      id="spacestation-timeline"
      ref={sectionRef}
      style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 7rem) clamp(1rem, 4vw, 1.5rem)' }}
    >
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: '-5%', bottom: '20%', pointerEvents: 'none',
        width: '380px', height: '380px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>

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
            {language === 'de' ? 'Erfahrung & Bildung' : 'Experience & Education'}
          </p>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EEF2FF',
            margin: '0 0 0.75rem', letterSpacing: '-0.02em',
          }}>
            {sectionTitle}
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', color: 'rgba(148,163,184,0.55)', margin: 0,
          }}>
            {sectionSub}
          </p>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>

          {/* Animated vertical line — desktop */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: '1px', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.04)',
          }}
          className="hidden md:block"
          >
            <motion.div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: 'linear-gradient(to bottom, var(--blue), var(--purple))',
              scaleY: lineScaleY,
              transformOrigin: 'top',
              height: '100%',
            }} />
          </div>

          {/* Mobile line */}
          <div style={{
            position: 'absolute', left: '22px', top: 0, bottom: 0,
            width: '1px', background: 'rgba(255,255,255,0.05)',
          }}
          className="md:hidden"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {spacestationModules.map((module, index) => {
              const isExperience = module.type === 'experience';
              const isRight      = index % 2 !== 0;

              return (
                <motion.div
                  key={module.id}
                  id={module.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  style={{ position: 'relative' }}
                >
                  {/* Desktop: two-column */}
                  <div className="hidden md:flex" style={{ alignItems: 'center' }}>

                    {/* Left slot — odd items */}
                    <div style={{ flex: 1, paddingRight: '2.5rem' }}>
                      {isRight && (
                        isExperience
                          ? <ExperienceCard module={module as ExperienceModule} />
                          : <EducationCard  module={module as EducationModule} />
                      )}
                    </div>

                    {/* Center icon */}
                    <div style={{
                      flexShrink: 0, position: 'relative', zIndex: 1,
                      width: '40px', height: '40px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isExperience ? 'rgba(59,130,246,0.12)' : 'rgba(124,58,237,0.12)',
                      border: `1px solid ${isExperience ? 'rgba(96,165,250,0.25)' : 'rgba(167,139,250,0.25)'}`,
                      boxShadow: isExperience
                        ? '0 0 16px rgba(59,130,246,0.2)'
                        : '0 0 16px rgba(124,58,237,0.2)',
                    }}>
                      {isExperience
                        ? <Briefcase     size={15} color="rgba(96,165,250,0.9)" />
                        : <GraduationCap size={15} color="rgba(167,139,250,0.9)" />}
                    </div>

                    {/* Right slot — even items */}
                    <div style={{ flex: 1, paddingLeft: '2.5rem' }}>
                      {!isRight && (
                        isExperience
                          ? <ExperienceCard module={module as ExperienceModule} />
                          : <EducationCard  module={module as EducationModule} />
                      )}
                    </div>
                  </div>

                  {/* Mobile: single column */}
                  <div className="flex md:hidden" style={{ alignItems: 'flex-start', gap: '1.25rem' }}>
                    <div style={{
                      flexShrink: 0, zIndex: 1, position: 'relative',
                      width: '44px', height: '44px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: '0',
                      background: isExperience ? 'rgba(59,130,246,0.12)' : 'rgba(124,58,237,0.12)',
                      border: `1px solid ${isExperience ? 'rgba(96,165,250,0.25)' : 'rgba(167,139,250,0.25)'}`,
                    }}>
                      {isExperience
                        ? <Briefcase     size={15} color="rgba(96,165,250,0.9)" />
                        : <GraduationCap size={15} color="rgba(167,139,250,0.9)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isExperience
                        ? <ExperienceCard module={module as ExperienceModule} />
                        : <EducationCard  module={module as EducationModule} />}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpaceStationTimeline;
