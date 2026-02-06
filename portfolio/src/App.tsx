import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SvgSeparator from './components/SvgSeparator';
import SideNav from './components/SideNav'; // Import SideNav
import GalaxyBackgroundSvg from './assets/astronomy-galaxy-space-svgrepo-com.svg?react'; // Import the galaxy SVG
import CursorEffect from './components/CursorEffect'; // Import CursorEffect

function App() {
  return (
    <div className="App">
      <SideNav /> {/* Add SideNav */}
      <div className="stars">
        {[...Array(100)].map((_, i) => (
          <div className="star" key={i} />
        ))}
      </div>
      <GalaxyBackgroundSvg className="galaxy-background" /> {/* Add galaxy background */}
      <Header />
      <main>
        <Hero />
        <SvgSeparator /> {/* Separator after Hero */}
        <About />
        <SvgSeparator /> {/* Separator after About */}
        <Projects />
        <SvgSeparator /> {/* Separator after Projects */}
        <Contact />
      </main>
      <Footer />
      <CursorEffect /> {/* Add CursorEffect */}
    </div>
  );
}

export default App;