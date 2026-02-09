import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { projects } from '../ProjectData';
import CssGridGenerator from './CssGridGenerator';
import PlanetaryDashboard from './PlanetaryDashboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // Import SyntaxHighlighter
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Import a style

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentProjectId = Number(projectId);
  const projectIndex = projects.findIndex(p => p.id === currentProjectId);
  const project = projects[projectIndex];

  if (!project) {
    return (
      <main id="main-content" className="project-detail-container project-not-found">
        <h1 className="project-detail-title">Project Not Found</h1>
        <p>The requested project could not be found. Please return to the constellation map to select another project.</p>
        <Link to="/" className="btn-custom">Back to Constellations</Link>
      </main>
    );
  }

  const goToNextProject = () => {
    const nextIndex = (projectIndex + 1) % projects.length;
    navigate(`/project/${projects[nextIndex].id}`);
  };

  const goToPreviousProject = () => {
    const prevIndex = (projectIndex - 1 + projects.length) % projects.length;
    navigate(`/project/${projects[prevIndex].id}`);
  };

  const renderProjectContent = () => {
    switch (currentProjectId) {
      case 1:
        return <CssGridGenerator />;
      case 2:
        return <PlanetaryDashboard />;
      default:
        return (
          <>
            <section className="project-overview">
              <h2 className="sr-only">Project Overview</h2>
              <p className="project-detail-description">{project.description}</p>
              <div className="project-media-placeholder" aria-label={`Interactive demo or screenshot of ${project.title}`}>
                <p>Interactive Demo / Screenshot for {project.title} coming soon!</p>
              </div>
            </section>

            <section className="project-tech-stack">
              <h2 className="sr-only">Technologies Used</h2>
              <div className="technologies">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag tech-button">{tech}</span>
                ))}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <main id="main-content" className="project-detail-container" aria-labelledby="project-main-heading">
      <h1 id="project-main-heading" className="project-detail-title">{project.title}</h1>

      {renderProjectContent()}
      
      <section className="technical-insights-section">
        <h2 className="section-title">{t('project.technicalInsightsTitle')}</h2>
        <div className="technical-insights-content">
          <p>{project.technicalInsight}</p>
          {project.codeSnippets && project.codeSnippets.length > 0 && (
            <div className="code-snippets-container">
              <h3>{t('project.codeSnippetsTitle')}</h3>
              {project.codeSnippets.map((snippet, index) => (
                <div key={index} className="code-snippet-box">
                  <div className="code-snippet-header">{snippet.title}</div>
                  <SyntaxHighlighter language={snippet.language} style={atomDark} customStyle={{ padding: '1rem', borderRadius: '5px' }}>
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="project-navigation">
        <h2 className="sr-only">Project Navigation</h2>
        <div className="project-detail-links">
          <button onClick={goToPreviousProject} className="btn-custom" aria-label="Go to previous project">Previous Project</button>
          {currentProjectId !== 1 && currentProjectId !== 2 && (
            <a href={project.link} className="btn-custom" target="_blank" rel="noopener noreferrer" aria-label={`View live version of ${project.title}`}>View Live Project</a>
          )}
          <button onClick={goToNextProject} className="btn-custom" aria-label="Go to next project">Next Project</button>
        </div>
      </section>

      <Link to="/" className="btn-custom back-to-constellations">Back to Constellations</Link>
    </main>
  );
};

export default ProjectDetail;
