import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <h1 className="site-title">My Portfolio</h1>
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <nav className={`main-nav ${isMenuOpen ? 'menu-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item"><a href="#home" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li className="nav-item"><a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</a></li>
            <li className="nav-item"><a href="#projects" className="nav-link" onClick={() => setIsMenuOpen(false)}>Projects</a></li>
            <li className="nav-item"><a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;