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
  technicalInsight: string; // New field for technical explanation
  codeSnippets?: { // New field for code snippets
    title: string;
    code: string;
    language: string;
  }[];
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'CSS Grid Generator',
    description: 'An interactive tool to visually design CSS Grids, allowing users to define grid dimensions and merge cells to generate corresponding CSS `grid-template-areas` code.',
    technologies: ['React', 'TypeScript', 'CSS Grid', 'SCSS', 'State Management'],
    link: 'https://github.com/your-github/css-grid-generator', // Placeholder link
    position: { top: '20%', left: '15%' },
    technicalInsight: 'This project demonstrates advanced React state management, dynamic CSS manipulation, and client-side code generation. It uses React hooks for UI state, SCSS for styling, and JavaScript to calculate and generate CSS Grid code based on user interactions. Key features include real-time visual feedback and robust error handling for grid definitions.',
    codeSnippets: [
      {
        title: 'Generating CSS Grid Areas (JavaScript)',
        code: `const generateGridAreas = (rows, cols, mergedCells) => {
  let grid = Array(rows).fill(0).map(() => Array(cols).fill('.'));
  // Logic to fill grid with area names and handle merged cells
  // ...
  return grid.map(row => \`"\${row.join(' ')}"\`).join('\\n');
};`,
        language: 'javascript'
      },
      {
        title: 'React Component State (TypeScript)',
        code: `interface GridState {
  rows: number;
  cols: number;
  selectedCells: Set<string>;
  mergedAreas: { [key: string]: string };
}

const [gridState, setGridState] = useState<GridState>({
  rows: 4,
  cols: 4,
  selectedCells: new Set(),
  mergedAreas: {},
});`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 2,
    title: 'Planetary Dashboard', // Direct string, as Project interface doesn't support translation keys
    description: 'An interactive dashboard displaying real-time data about planets, featuring filtering, sorting, and dynamic data presentation. Built with React and a Node.js API.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express.js', 'API Integration', 'Three.js', 'React-Three-Fiber'],
    link: '/planetary-dashboard', // Internal route
    position: { top: '50%', left: '35%' },
    technicalInsight: 'This dashboard leverages React for a dynamic frontend, consuming data from a custom Node.js/Express backend API. It showcases data fetching, filtering, and sorting capabilities. A standout feature is the integration of Three.js via React-Three-Fiber to render interactive 3D planet models, demonstrating complex visual rendering and animation in a React environment. CORS is enabled on the backend to facilitate API communication.',
    codeSnippets: [
      {
        title: 'Node.js API Endpoint (server.js)',
        code: `app.get('/api/planets', (req, res) => {
  const planets = require('./planets.json');
  res.json(planets);
});`,
        language: 'javascript'
      },
      {
        title: 'React Planet 3D Model (TypeScript/Three.js)',
        code: `const Planet3DModel: React.FC<Planet3DModelProps> = ({ textureUrl, size = 1, rotationSpeed = 0.005 }) => {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(textureUrl); // Loads texture

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed; // Rotate the planet
    }
  });

  return (
    <Sphere args={[size, 64, 64]} ref={meshRef}>
      <meshStandardMaterial map={texture} />
    </Sphere>
  );
};`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 3,
    title: 'Project Gamma',
    description: 'A brief description of Project Gamma, highlighting its key features and technologies.',
    technologies: ['Python', 'Django', 'PostgreSQL'],
    link: '#',
    position: { top: '30%', left: '60%' },
    technicalInsight: 'This project illustrates full-stack development using Python with the Django framework for the backend, and PostgreSQL for robust data management. It features RESTful API design, database migrations, user authentication, and a scalable architecture suitable for complex web applications. Frontend interactions are handled through Django templates with sprinkles of JavaScript.'
  },
  {
    id: 4,
    title: 'Project Delta',
    description: 'A brief description of Project Delta, highlighting its key features and technologies.',
    technologies: ['Vue.js', 'Firebase', 'TailwindCSS'],
    link: '#',
    position: { top: '65%', left: '75%' },
    technicalInsight: 'Project Delta highlights modern frontend development with Vue.js for a reactive user interface, backed by Firebase for a serverless architecture including authentication and real-time database capabilities. Styling is efficiently managed using TailwindCSS, demonstrating rapid UI development and responsive design principles. It emphasizes quick prototyping and scalable cloud integration.'
  },
];
