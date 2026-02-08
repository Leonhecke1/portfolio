import Hero from './Hero';
import About from './About';
import SpaceStationTimeline from './SpaceStationTimeline';
import Projects from './Projects';
import Contact from './Contact';
import SvgSeparator from './SvgSeparator';

const HomePage = () => {
  return (
    <main>
      <Hero />
      <SvgSeparator />
      <About />
      <SvgSeparator />
      <SpaceStationTimeline /> {/* Render the new SpaceStationTimeline component */}
      <SvgSeparator />
      <Projects />
      <SvgSeparator />
      <Contact />
    </main>
  );
};

export default HomePage;
