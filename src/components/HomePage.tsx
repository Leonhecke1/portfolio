import Hero from './Hero';
import About from './About';
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
      <Projects />
      <SvgSeparator />
      <Contact />
    </main>
  );
};

export default HomePage;
