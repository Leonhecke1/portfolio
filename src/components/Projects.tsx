import { motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../ProjectData';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fadeUp, stagger, viewport } from '../lib/motion';

/* CSS-3D tilt helpers — RAF-throttled so we update at most once per frame */
let _tiltRaf: number | null = null;

const onTiltEnter = (e: React.MouseEvent<HTMLElement>) => {
  const el   = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const x    = (e.clientX - rect.left) / rect.width  - 0.5;
  const y    = (e.clientY - rect.top)  / rect.height - 0.5;
  el.style.transform   = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.01)`;
  el.style.borderColor = 'rgba(96,165,250,0.25)';
  el.style.boxShadow   = '0 24px 64px rgba(0,0,0,0.45), 0 0 40px rgba(59,130,246,0.07), inset 0 1px 0 rgba(255,255,255,0.06)';
};
const onTiltMove = (e: React.MouseEvent<HTMLElement>) => {
  if (_tiltRaf !== null) return;
  // Capture values synchronously before the async rAF fires
  const el     = e.currentTarget as HTMLElement;
  const rect   = el.getBoundingClientRect();
  const cx     = e.clientX;
  const cy     = e.clientY;
  _tiltRaf = requestAnimationFrame(() => {
    _tiltRaf = null;
    const x = (cx - rect.left) / rect.width  - 0.5;
    const y = (cy - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.01)`;
  });
};
const onTiltLeave = (e: React.MouseEvent<HTMLElement>) => {
  if (_tiltRaf !== null) { cancelAnimationFrame(_tiltRaf); _tiltRaf = null; }
  const el = e.currentTarget as HTMLElement;
  el.style.transform   = 'perspective(900px) rotateY(0) rotateX(0) translateY(0) scale(1)';
  el.style.borderColor = 'rgba(255,255,255,0.07)';
  el.style.boxShadow   = 'none';
};

const TechTag = ({ tech }: { tech: string }) => (
  <span style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '10px', padding: '3px 10px', borderRadius: '6px',
    background: 'rgba(59,130,246,0.09)',
    border: '1px solid rgba(96,165,250,0.16)',
    color: 'rgba(147,197,253,0.8)',
    letterSpacing: '0.04em',
  }}>
    {tech}
  </span>
);

const Projects = () => {
  const { t }       = useLanguage();
  const { content } = useContent();
  const navigate    = useNavigate();
  const projects    = content.projects;

  const handleClick = (project: Project) => {
    if (project.link.startsWith('/') && project.link !== '/') {
      navigate(project.link);
    } else if (project.link === '#') {
      navigate(`/project/${project.id}`);
    } else {
      navigate(`/project/${project.id}`);
    }
  };

  const [featured, ...rest] = projects;

  return (
    <section id="projects" style={{ position: 'relative', padding: 'clamp(4rem, 10vw, 7rem) clamp(1rem, 4vw, 1.5rem)' }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: '-5%', top: '30%', pointerEvents: 'none',
        width: '450px', height: '450px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
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
            What I've built
          </p>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#EEF2FF',
            margin: 0, letterSpacing: '-0.02em',
          }}>
            {t('projects.title')}
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >

          {/* ── Featured card ── */}
          <motion.article
            variants={fadeUp}
            onClick={() => handleClick(featured)}
            onMouseEnter={onTiltEnter}
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleClick(featured)}
            className="group grid grid-cols-1 lg:grid-cols-2 items-center"
            style={{
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
              willChange: 'transform',
              gap: 'clamp(1.5rem, 4vw, 2.5rem)',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle sheen */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '20px', pointerEvents: 'none',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
              opacity: 0, transition: 'opacity 0.3s',
            }} className="group-hover-sheen" />

            {/* Left: content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px', color: 'rgba(96,165,250,0.6)', letterSpacing: '0.1em',
                }}>
                  FEATURED
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(96,165,250,0.15)' }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px', color: 'rgba(71,85,105,0.7)', letterSpacing: '0.06em',
                }}>
                  {String(featured.id).padStart(2, '0')}
                </span>
              </div>

              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#EEF2FF',
                marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.02em',
              }}>
                {featured.title}
              </h3>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px', color: 'rgba(148,163,184,0.75)',
                lineHeight: 1.75, marginBottom: '1.5rem', maxWidth: '480px',
              }}>
                {featured.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem' }}>
                {featured.technologies.slice(0, 6).map(tech => (
                  <TechTag key={tech} tech={tech} />
                ))}
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '13.5px',
                color: 'rgba(96,165,250,0.8)',
                transition: 'color 0.2s',
              }}>
                View project <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Right: code preview card — desktop only */}
            <div className="hidden lg:block" style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              overflow: 'hidden',
              minHeight: '180px',
            }}>
              {/* macOS dots */}
              <div style={{
                display: 'flex', gap: '6px', padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                {['rgba(239,68,68,0.6)', 'rgba(245,158,11,0.6)', 'rgba(34,197,94,0.6)'].map(c => (
                  <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c }} />
                ))}
              </div>
              <pre style={{
                margin: 0, padding: '1rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px', lineHeight: 1.7,
                color: 'rgba(148,163,184,0.55)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
{`const generateGridAreas = (
  rows, cols, merged
) => {
  let grid = Array(rows)
    .fill(0).map(() =>
      Array(cols).fill('.'));

  return grid
    .map(row => \`"\${row.join(' ')}"\`)
    .join('\\n');
};`}
              </pre>
            </div>
          </motion.article>

          {/* ── Responsive smaller cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
            {rest.map((project) => (
              <motion.article
                key={project.id}
                variants={fadeUp}
                onClick={() => handleClick(project)}
                onMouseEnter={onTiltEnter}
                onMouseMove={onTiltMove}
                onMouseLeave={onTiltLeave}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleClick(project)}
                className="group"
                style={{
                  padding: '1.5rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
                  willChange: 'transform',
                  outline: 'none',
                  display: 'flex', flexDirection: 'column', gap: '0.875rem',
                }}
              >
                {/* Number + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px', color: 'rgba(71,85,105,0.75)', letterSpacing: '0.08em',
                  }}>
                    {String(project.id).padStart(2, '0')}
                  </span>
                  <div style={{ color: 'rgba(96,165,250,0.6)', opacity: 0, transition: 'opacity 0.2s' }}
                       className="arrow-icon">
                    <ExternalLink size={13} />
                  </div>
                </div>

                <h3 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '1.0625rem', color: '#EEF2FF',
                  lineHeight: 1.3, margin: 0,
                }}>
                  {project.title}
                </h3>

                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px', color: 'rgba(148,163,184,0.65)',
                  lineHeight: 1.7, margin: 0, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {project.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
                  {project.technologies.slice(0, 4).map(tech => (
                    <TechTag key={tech} tech={tech} />
                  ))}
                  {project.technologies.length > 4 && (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(100,116,139,0.7)',
                    }}>
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>

                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12.5px', fontWeight: 500,
                  color: 'rgba(71,85,105,0.8)',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(96,165,250,0.8)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(71,85,105,0.8)'; }}
                >
                  View project <span style={{ display: 'inline-block', transition: 'transform 0.2s' }}>→</span>
                </div>
              </motion.article>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
