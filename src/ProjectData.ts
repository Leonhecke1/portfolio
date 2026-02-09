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
    title: 'Sandbox',
    description: 'An interactive sandbox environment where users can drag, drop, and configure various UI and layout building blocks to create custom designs.',
    technologies: ['React', 'TypeScript', 'State Management', 'Dynamic UI', 'dnd-kit'],
    link: '#',
    position: { top: '65%', left: '75%' },
    technicalInsight: 'This project demonstrates advanced React component composition, dynamic rendering of UI elements based on user interaction, and effective state management to handle the addition and configuration of building blocks. It serves as a foundation for a customizable design tool or prototyping environment, showcasing modular and extensible frontend architecture. Key technical aspects include the use of `dnd-kit` for drag-and-drop functionality, dynamic SVG rendering for connection lines, and a modal-based configuration system for inter-block interactions.',
    codeSnippets: [
      {
        title: 'Block Interface Definition',
        code: `export interface Block {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  color?: string;
  bgColor?: string;
  props?: any;
}`,
        language: 'typescript'
      },
      {
        title: 'Draggable Component Structure',
        code: `function Draggable(props: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: props.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} {...listeners} {...attributes}>
      {props.children}
      {/* Buttons for remove/connect */}
    </div>
  );
}`,
        language: 'tsx'
      },
      {
        title: 'Save Connection Logic',
        code: `const handleSaveConnectionConfig = (configuredConnection: Connection) => {
  if (configuredConnection.id) {
    setConnections(prev => prev.map(conn => conn.id === configuredConnection.id ? configuredConnection : conn));
  } else {
    setConnections(prev => [...prev, { ...configuredConnection, id: \`conn-\${Date.now()}\` }]);
  }
  // Close modal logic
};`,
        language: 'typescript'
      }
    ]
  },
];
