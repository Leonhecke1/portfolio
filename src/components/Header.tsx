import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setIsMenuOpen(false); // Close menu on click
    if (location.pathname === '/') {
      // If on the homepage, scroll to the section
      e.preventDefault(); // Prevent default Link navigation
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
    // If not on the homepage, Link will navigate to '/' with the hash.
    // A separate useEffect in App.tsx would be needed for perfect hash scrolling after navigation.
    // For now, rely on browser's default hash behavior after navigation, which is often not smooth/reliable with SPAs.
  };

  const handleHomeLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <h1 className="site-title">My Portfolios</h1>
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <nav className={`main-nav ${isMenuOpen ? 'menu-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={handleHomeLinkClick}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/#about" className="nav-link" onClick={(e) => handleNavLinkClick(e, 'about')}>About</Link>
            </li>
            <li className="nav-item">
              <Link to="/#projects" className="nav-link" onClick={(e) => handleNavLinkClick(e, 'projects')}>Projects</Link>
            </li>
            <li className="nav-item">
              <Link to="/#contact" className="nav-link" onClick={(e) => handleNavLinkClick(e, 'contact')}>Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;