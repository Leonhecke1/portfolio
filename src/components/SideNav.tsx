import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SideNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Only update active section if on the homepage
      if (location.pathname === '/') {
        const sections = ['home', 'about', 'projects', 'contact'];
        // Adjust scroll position check to be more forgiving or centered
        const scrollPosition = window.scrollY + window.innerHeight / 2.5; // Slightly above center

        let currentActive = 'home'; // Default to home if no other section is active

        for (const sectionId of sections) {
          const section = document.getElementById(sectionId);
          if (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
              currentActive = sectionId;
              break;
            }
          }
        }
        setActiveSection(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check on mount
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]); // Re-run effect if path changes, to reset active state or stop scrolling logic

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (location.pathname === '/') {
      e.preventDefault(); // Prevent default Link navigation
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
    // If not on homepage, Link will handle navigation to /#targetId
    // For robust hash scrolling after navigation, App.tsx would need a useEffect for location.hash
  };

  return (
    <nav className="side-nav">
      <ul>
        <li>
          <Link
            to="/#home"
            className={activeSection === 'home' ? 'active' : ''}
            onClick={(e) => handleNavLinkClick(e, 'home')}
          >
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link
            to="/#about"
            className={activeSection === 'about' ? 'active' : ''}
            onClick={(e) => handleNavLinkClick(e, 'about')}
          >
            <span>About</span>
          </Link>
        </li>
        <li>
          <Link
            to="/#projects"
            className={activeSection === 'projects' ? 'active' : ''}
            onClick={(e) => handleNavLinkClick(e, 'projects')}
          >
            <span>Projects</span>
          </Link>
        </li>
        <li>
          <Link
            to="/#contact"
            className={activeSection === 'contact' ? 'active' : ''}
            onClick={(e) => handleNavLinkClick(e, 'contact')}
          >
            <span>Contact</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SideNav;
