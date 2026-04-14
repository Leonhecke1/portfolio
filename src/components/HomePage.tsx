import Hero from './Hero';
import TechMarquee from './TechMarquee';
import About from './About';
import Capabilities from './Capabilities';
import SpaceStationTimeline from './SpaceStationTimeline';
import Projects from './Projects';
import Lab from './Lab';
import Contact from './Contact';

const HomePage = () => {
  return (
    <main>
      <Hero />
      <TechMarquee />
      <About />
      <Capabilities />
      <SpaceStationTimeline />
      <Projects />
      <Lab />
      <Contact />
    </main>
  );
};

export default HomePage;
