import Hero from './Hero';
import TechMarquee from './TechMarquee';
import About from './About';
import Capabilities from './Capabilities';
import SpaceStationTimeline from './SpaceStationTimeline';
import Projects from './Projects';
import Lab from './Lab';
import Contact from './Contact';
import { useContent } from '../contexts/ContentContext';

const HomePage = () => {
  const { content } = useContent();
  const s = content.settings;
  return (
    <main>
      <Hero />
      {s?.showMarquee !== false && <TechMarquee />}
      <About />
      <Capabilities />
      <SpaceStationTimeline />
      <Projects />
      {s?.showLab !== false && <Lab />}
      <Contact />
    </main>
  );
};

export default HomePage;
