import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { projects } from '../ProjectData';
import { PART_NAMES, STEP_GROUPS, builtProjects, groupFor, groupsUpTo, stepOf } from '../buildData';
import BuildModel from './build/BuildModel';
import { usePartLinks } from './build/usePartLinks';
import CssGridGenerator from './demos/CssGridGenerator';
import ImageCompressor from './demos/ImageCompressor';
import ContrastChecker from './demos/ContrastChecker';
import KanbanBoard from './demos/KanbanBoard';
import RegexTester from './demos/RegexTester';
import FluidTypeCalculator from './demos/FluidTypeCalculator';
import FocusTimer from './demos/FocusTimer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DEMOS: Record<number, React.FC> = {
  1: CssGridGenerator,
  2: ImageCompressor,
  3: ContrastChecker,
  4: KanbanBoard,
  5: RegexTester,
  6: FluidTypeCalculator,
  7: FocusTimer,
};

// A project page is one build step of the booklet: parts, the model up to this part, the live demo as a sub-assembly.
const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t, language } = useLanguage();
  const project = projects.find((p) => p.id === Number(projectId));
  const navigate = useNavigate();
  const { projectOf, labelFor, nameFor } = usePartLinks();
  // On a project page a part opens its own project; the desk leads back to the career step.
  const hrefFor = (group: string) => {
    const p = projectOf(group);
    return p ? `/project/${p.id}` : '/#schritt-1';
  };

  if (!project) {
    return (
      <main id="main" className="page step-page">
        <h1 className="step-page-title">{t('project.notFound')}</h1>
        <p className="step-lede">{t('project.notFoundText')}</p>
        <Link to="/" className="btn">{t('project.back')}</Link>
      </main>
    );
  }

  const n = stepOf(project);
  const index = builtProjects.findIndex((p) => p.id === project.id);
  const prev = index > 0 ? builtProjects[index - 1] : null;
  const next = index < builtProjects.length - 1 ? builtProjects[index + 1] : null;
  const Demo = DEMOS[project.id];
  const part = PART_NAMES[project.id];

  return (
    <main id="main" className="page step-page" aria-labelledby="step-page-title">
      <Link to={`/#schritt-${n}`} className="back-link">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
        {t('project.back')}
      </Link>

      <header className="step-page-head">
        <div>
          <div className="step-page-ident">
            <p className="step-num" aria-hidden="true">{n}</p>
            <div>
              <p className="step-class">
                <span className="swatch" data-color={project.brick.color} aria-hidden="true" />
                {part ? `${part[language]} · ` : ''}{project.objectClass[language]}
              </p>
              <h1 id="step-page-title" className="step-page-title">{project.title[language]}</h1>
            </div>
          </div>
          <p className="step-lede">{project.description[language]}</p>
          <div className="parts">
            <p className="parts-title">{t('step.parts')}</p>
            <ul className="part-list">
              {project.technologies.map((tech) => (
                <li key={tech}><span>{tech}</span><span className="qty">×1</span></li>
              ))}
            </ul>
          </div>
          {project.repo && (
            <a href={project.repo} className="btn-accent repo-link" target="_blank" rel="noopener noreferrer">{t('project.repo')}</a>
          )}
        </div>
        <figure className="step-page-model">
          <BuildModel placed={groupsUpTo(n)} newest={groupFor(project)} calloutLabel={part?.[language]} title={`${t('model.step')} ${n}: ${project.title[language]}`} labelFor={labelFor} nameFor={nameFor} hrefFor={hrefFor} onPick={(group) => navigate(hrefFor(group))} />
          <figcaption>{t('model.step')} {n} / {STEP_GROUPS.length}</figcaption>
        </figure>
      </header>

      <section className="subassembly" aria-labelledby="demo-title">
        <h2 id="demo-title" className="subassembly-title">{t('project.demo')}</h2>
        <div className="subassembly-body">{Demo ? <Demo /> : <p className="step-note">{t('project.comingSoon')}</p>}</div>
      </section>

      <section className="howto" aria-labelledby="howto-title">
        <h2 id="howto-title" className="section-heading">{t('project.technicalInsightsTitle')}</h2>
        <p className="howto-text">{project.technicalInsight[language]}</p>
        {project.codeSnippets && project.codeSnippets.length > 0 && (
          <ol className="snippets" aria-label={t('project.codeSnippetsTitle')}>
            {project.codeSnippets.map((snippet, i) => (
              <li key={snippet.title} className="snippet">
                <p className="snippet-head">
                  <span className="snippet-step">{n}{String.fromCharCode(97 + i)}</span>
                  {snippet.title}
                </p>
                <SyntaxHighlighter
                  language={snippet.language}
                  style={oneLight}
                  customStyle={{ margin: 0, padding: '1.25rem 1.5rem', background: 'transparent', borderRadius: 0, fontSize: '0.8125rem' }}
                  codeTagProps={{ style: { fontFamily: 'var(--mono)', background: 'transparent' } }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </li>
            ))}
          </ol>
        )}
      </section>

      <nav className="step-nav" aria-label={t('project.stepNav')}>
        {prev ? (
          <Link to={`/project/${prev.id}`} className="step-nav-link">
            <span className="step-nav-dir">{t('model.step')} {stepOf(prev)}</span>
            <span className="step-nav-name">{prev.title[language]}</span>
          </Link>
        ) : (
          <Link to="/#schritt-1" className="step-nav-link">
            <span className="step-nav-dir">{t('model.step')} 1</span>
            <span className="step-nav-name">{t('step.baseplate')}</span>
          </Link>
        )}
        {next ? (
          <Link to={`/project/${next.id}`} className="step-nav-link step-nav-link--next">
            <span className="step-nav-dir">{t('model.step')} {stepOf(next)}</span>
            <span className="step-nav-name">{next.title[language]}</span>
          </Link>
        ) : (
          <Link to="/#fertig" className="step-nav-link step-nav-link--next">
            <span className="step-nav-dir">{t('step.done')}</span>
            <span className="step-nav-name">{t('nav.contact')}</span>
          </Link>
        )}
      </nav>
    </main>
  );
};

export default ProjectDetail;
