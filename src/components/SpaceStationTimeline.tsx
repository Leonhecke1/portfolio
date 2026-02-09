import React, { useRef, useEffect, useState } from 'react';
import { spacestationModules, type SpacestationModule } from '../spacestationData';
import './SpaceStationTimeline.css'; // Will create this file next

const SpaceStationTimeline: React.FC = () => {
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveItems((prev) => new Set(prev.add(entry.target.id)));
          } else {
            setActiveItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(entry.target.id);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the item is visible
    );

    timelineRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      timelineRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <section id="spacestation-timeline" className="spacestation-timeline-section">
      <div className="section-container">
        <h2 className="section-title">Mein Werdegang: Die Raumstation</h2>
        <p className="section-subtitle">Erkunde die Module meiner beruflichen und akademischen Reise.</p>

        <div className="timeline">
          {spacestationModules.map((module, index) => (
            <div
              key={module.id}
              id={module.id}
              ref={(el) => (timelineRefs.current[index] = el)}
              className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} ${
                activeItems.has(module.id) ? 'active' : ''
              }`}
            >
              <div className="timeline-content">
                <span className="timeline-date">{module.date}</span>
                {module.type === 'experience' ? (
                  <>
                    <h3>{module.title}</h3>
                    <h4>{module.company}</h4>
                    <ul>
                      {module.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3>{module.degree}</h3>
                    <h4>{module.institution}</h4>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpaceStationTimeline;
