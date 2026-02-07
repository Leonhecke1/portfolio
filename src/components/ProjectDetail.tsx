import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projects } from '../ProjectData';
import CssGridGenerator from './CssGridGenerator'; // Import the new component

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
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

  return (
    <main id="main-content" className="project-detail-container" aria-labelledby="project-main-heading">
      <h1 id="project-main-heading" className="project-detail-title">{project.title}</h1>

      {currentProjectId === 1 ? ( // Render CssGridGenerator for Project Alpha
        <CssGridGenerator />
      ) : ( // Render generic details for other projects
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
                <span key={index} className="tech-tag">{tech}</span>
              ))}
            </div>
          </section>
        </>
      )}
      
      <section className="project-navigation">
        <h2 className="sr-only">Project Navigation</h2>
        <div className="project-detail-links">
          <button onClick={goToPreviousProject} className="btn-custom" aria-label="Go to previous project">Previous Project</button>
          {currentProjectId !== 1 && ( // Only show "View Live Project" if it's not the grid generator itself
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
