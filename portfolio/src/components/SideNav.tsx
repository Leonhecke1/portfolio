import React, { useState, useEffect } from 'react';

const SideNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'projects', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className="side-nav">
      <ul>
        <li>
          <a href="#home" className={activeSection === 'home' ? 'active' : ''}>
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="#about" className={activeSection === 'about' ? 'active' : ''}>
            <span>About</span>
          </a>
        </li>
        <li>
          <a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>
            <span>Projects</span>
          </a>
        </li>
        <li>
          <a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>
            <span>Contact</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default SideNav;
