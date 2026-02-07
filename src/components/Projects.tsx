import React from 'react';

const Projects: React.FC = () => {
  return (
    <section id="projects" className="projects-section">
      <div className="section-container">
        <h2 className="section-title">My Projects</h2>
        <div className="project-grid">
          <div className="project-card custom-card">
            <h5 className="card-title">Project Alpha</h5>
            <p className="card-text">A brief description of Project Alpha, highlighting its key features and technologies.</p>
            <a href="#" className="btn-custom">View Project</a>
          </div>
          <div className="project-card custom-card">
            <h5 className="card-title">Project Beta</h5>
            <p className="card-text">A brief description of Project Beta, highlighting its key features and technologies.</p>
            <a href="#" className="btn-custom">View Project</a>
          </div>
          <div className="project-card custom-card">
            <h5 className="card-title">Project Gamma</h5>
            <p className="card-text">A brief description of Project Gamma, highlighting its key features and technologies.</p>
            <a href="#" className="btn-custom">View Project</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;