import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="main-header">
      <div className="header-container">
        <h1 className="site-title">My Portfolio</h1>
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item"><a href="#home" className="nav-link">Home</a></li>
            <li className="nav-item"><a href="#about" className="nav-link">About</a></li>
            <li className="nav-item"><a href="#projects" className="nav-link">Projects</a></li>
            <li className="nav-item"><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;