import { Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { useEffect } from 'react'; // Import useEffect
import Header from './components/Header';
import Footer from './components/Footer';
import SideNav from './components/SideNav';
import GalaxyBackgroundSvg from './assets/astronomy-galaxy-space-svgrepo-com.svg?react';
import HomePage from './components/HomePage';
import ProjectDetail from './components/ProjectDetail';

function App() {
  const location = useLocation(); // Initialize useLocation

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Scroll to top if no hash, common behavior for new page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]); // Re-run effect when location object changes

  return (
    <div className="App">
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
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;