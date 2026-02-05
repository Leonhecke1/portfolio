import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SvgSeparator from './components/SvgSeparator';

function App() {
  return (
    <div className="App">
      <div className="stars">
        {[...Array(100)].map((_, i) => (
          <div className="star" key={i} />
        ))}
      </div>
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
    </div>
  );
}

export default App;