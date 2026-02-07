export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  link: string;
  position: {
    top: string;
    left: string;
  };
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'CSS Grid Generator',
    description: 'An interactive tool to visually design CSS Grids, allowing users to define grid dimensions and merge cells to generate corresponding CSS `grid-template-areas` code.',
    technologies: ['React', 'TypeScript', 'CSS Grid', 'SCSS', 'State Management'],
    link: 'https://github.com/your-github/css-grid-generator', // Placeholder link
    position: { top: '20%', left: '15%' },
  },
  {
    id: 2,
    title: 'Project Beta',
    description: 'A brief description of Project Beta, highlighting its key features and technologies.',
    technologies: ['Node.js', 'Express', 'MongoDB'],
    link: '#',
    position: { top: '50%', left: '35%' },
  },
  {
    id: 3,
    title: 'Project Gamma',
    description: 'A brief description of Project Gamma, highlighting its key features and technologies.',
    technologies: ['Python', 'Django', 'PostgreSQL'],
    link: '#',
    position: { top: '30%', left: '60%' },
  },
  {
    id: 4,
    title: 'Project Delta',
    description: 'A brief description of Project Delta, highlighting its key features and technologies.',
    technologies: ['Vue.js', 'Firebase', 'TailwindCSS'],
    link: '#',
    position: { top: '65%', left: '75%' },
  },
];
