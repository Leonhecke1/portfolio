import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ExternalLink, Code2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projects } from '../ProjectData';
import CssGridGenerator from './CssGridGenerator';
import PlanetaryDashboard from './PlanetaryDashboard';
import ProjectDeltaSandbox from './ProjectDeltaSandbox';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  borderRadius: '8px',
  padding: '0.625rem 1rem',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
};

const btnOutline: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(148,163,184,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: '#3B82F6',
  color: '#fff',
  boxShadow: '0 0 16px rgba(59,130,246,0.3)',
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentId   = Number(projectId);
  const idx         = projects.findIndex(p => p.id === currentId);
  const project     = projects[idx];

  if (!project) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: '#080C14' }}
      >
        <p className="font-syne font-bold text-4xl text-white mb-4">Not Found</p>
        <p className="font-dm-sans text-slate-400 mb-8">This project doesn't exist.</p>
        <Link to="/" style={btnPrimary}>
          <ArrowLeft size={14} /> Back to portfolio
        </Link>
      </main>
    );
  }

  const prevId = projects[(idx - 1 + projects.length) % projects.length].id;
  const nextId = projects[(idx + 1) % projects.length].id;

  const renderContent = () => {
    switch (currentId) {
      case 1: return <CssGridGenerator />;
      case 2: return <PlanetaryDashboard />;
      case 4: return <ProjectDeltaSandbox />;
      default:
        return (
          <div
            className="flex items-center justify-center rounded-2xl py-20"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(148,163,184,0.4)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            }}
          >
            Interactive demo coming soon
          </div>
        );
    }
  };

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: '#080C14' }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            to="/"
            style={btnOutline}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(96,165,250,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.9)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <ChevronLeft size={14} />
            Back to portfolio
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-10"
        >
          <p className="font-dm-sans text-xs text-blue-400 tracking-[0.2em] uppercase mb-3">
            Project {String(project.id).padStart(2, '0')}
          </p>
          <h1
            className="font-syne font-bold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
          >
            {project.title}
          </h1>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map(tech => (
              <span
                key={tech}
                className="font-dm-sans text-xs px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(96,165,250,0.18)',
                  color: 'rgba(147,197,253,0.85)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <p
            className="font-dm-sans leading-relaxed max-w-2xl"
            style={{ fontSize: '1.0625rem', color: 'rgba(148,163,184,0.85)' }}
          >
            {project.description}
          </p>
        </motion.div>

        {/* Project content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-14"
        >
          {renderContent()}
        </motion.div>

        {/* Technical insights */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div
            className="p-8 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <h2 className="font-syne font-bold text-xl text-white mb-4">
              {t('project.technicalInsightsTitle')}
            </h2>
            <p
              className="font-dm-sans leading-relaxed"
              style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.9375rem' }}
            >
              {project.technicalInsight}
            </p>
          </div>
        </motion.section>

        {/* Code snippets */}
        {project.codeSnippets && project.codeSnippets.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <h2 className="font-syne font-bold text-xl text-white mb-6 flex items-center gap-2.5">
              <Code2 size={18} color="rgba(96,165,250,0.8)" />
              {t('project.codeSnippetsTitle')}
            </h2>
            <div className="space-y-5">
              {project.codeSnippets.map((snippet, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="flex items-center gap-3 px-5 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex gap-1.5">
                      {['#FF5F57','#FEBC2E','#28C840'].map(c => (
                        <div key={c} className="rounded-full" style={{ width: '10px', height: '10px', background: c, opacity: 0.8 }} />
                      ))}
                    </div>
                    <span className="font-dm-sans text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                      {snippet.title}
                    </span>
                  </div>
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={atomDark}
                    customStyle={{
                      margin: 0,
                      padding: '1.25rem 1.5rem',
                      background: '#0D1220',
                      fontSize: '13px',
                      lineHeight: '1.65',
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Project navigation */}
        <div
          className="flex items-center justify-between pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => navigate(`/project/${prevId}`)}
            style={btnOutline}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(96,165,250,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.9)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          {project.link !== '#' && !project.link.startsWith('/') && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={btnPrimary}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#60A5FA';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow  = '0 0 24px rgba(59,130,246,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#3B82F6';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow  = '0 0 16px rgba(59,130,246,0.3)';
              }}
            >
              View Live <ExternalLink size={13} />
            </a>
          )}

          <button
            onClick={() => navigate(`/project/${nextId}`)}
            style={btnOutline}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(96,165,250,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.9)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </main>
  );
};

export default ProjectDetail;
