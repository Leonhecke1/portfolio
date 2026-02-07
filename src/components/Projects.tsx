import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects, type Project } from '../ProjectData';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [lines, setLines] = useState<Array<{x1: number, y1: number, x2: number, y2: number}>>([]);
  const [instructionClass, setInstructionClass] = useState('visible');
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const instructionTimer = setTimeout(() => {
      setInstructionClass('fading-out');
    }, 4000);

    const lineTimer = setTimeout(() => {
      const newLines = [];
      for (let i = 0; i < projects.length - 1; i++) {
        const star1 = starRefs.current[i];
        const star2 = starRefs.current[i+1];
        if (star1 && star2) {
          const x1 = star1.offsetLeft + star1.offsetWidth / 2;
          const y1 = star1.offsetTop + star1.offsetHeight / 2;
          const x2 = star2.offsetLeft + star2.offsetWidth / 2;
          const y2 = star2.offsetTop + star2.offsetHeight / 2;
          newLines.push({ x1, y1, x2, y2 });
        }
      }
      setLines(newLines);
    }, 100);

    return () => {
      clearTimeout(instructionTimer);
      clearTimeout(lineTimer);
    };
  }, []);

  const handleStarClick = (project: Project) => {
    setInstructionClass('fading-out'); // Fade out instruction on click
    navigate(`/project/${project.id}`);
  };

  return (
    <section id="projects" className="projects-section">
      <div className="section-container">
        <h2 className="section-title">Project Constellations</h2>
        <p className="section-subtitle">An interactive map of my work. Click a star to begin.</p>
        <div className="constellation-map">
          <div className={`instruction-overlay ${instructionClass}`}>
            <p>Click a star to explore a project</p>
          </div>
          <svg className="constellation-lines">
            {lines.map((line, index) => (
              <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
            ))}
          </svg>
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={el => starRefs.current[index] = el}
              className="project-star"
              style={{ top: project.position.top, left: project.position.left }}
              onClick={() => handleStarClick(project)}
            >
              <div className="star-glow"></div>
              <span className="star-label">{project.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;