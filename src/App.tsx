import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SideNav from './components/SideNav';
import GalaxyBackgroundSvg from './assets/astronomy-galaxy-space-svgrepo-com.svg?react';
import HomePage from './components/HomePage';
import ProjectDetail from './components/ProjectDetail';
import PlanetaryDashboard from './components/PlanetaryDashboard'; // Import PlanetaryDashboard
import { useNavigation } from './contexts/NavigationContext'; // Import useNavigation hook

function App() {
  const location = useLocation();
  const { isMenuOpen, toggleMenu } = useNavigation(); // Use navigation context

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close the menu automatically when the route changes
    if (isMenuOpen) {
      toggleMenu();
    }
  }, [location, isMenuOpen, toggleMenu]); // Add isMenuOpen and toggleMenu as dependencies

  // Effect to prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = ''; // Changed from 'unset' to ''
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = ''; // Changed from 'unset' to ''
    };
  }, [isMenuOpen]);

  return (
    <div className="App">
      {isMenuOpen && <div className="mobile-nav-overlay" onClick={toggleMenu}></div>} {/* Overlay */}
      <SideNav />
      <div className="stars">
        {[...Array(100)].map((_, i) => (
          <div className="star" key={i} />
        ))}
      </div>
      <GalaxyBackgroundSvg className="galaxy-background" />
      <Header />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:projectId" element={<ProjectDetail />} />
        <Route path="/planetary-dashboard" element={<PlanetaryDashboard />} /> {/* New Route */}
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;