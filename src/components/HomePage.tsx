import { ThemeProvider } from '../contexts/MissionControlContext';
import MissionControl from './MissionControl';

const HomePage: React.FC = () => {
  return (
    <ThemeProvider>
      <MissionControl />
    </ThemeProvider>
  );
};

export default HomePage;
