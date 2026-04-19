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
    title: 'Velox Canvas',
    description: 'A real-time particle physics playground built with the Canvas 2D API. 130 particles respond to mouse interaction through three physics modes — attract, repel, and orbital gravity — rendered at 60fps with velocity-driven trail effects and dynamic hue shifting.',
    technologies: ['TypeScript', 'Canvas 2D API', 'React Hooks', 'RequestAnimationFrame', 'Physics Simulation'],
    link: '#',
    position: { top: '30%', left: '60%' },
    technicalInsight: 'Velox Canvas demonstrates fine-grained control over browser rendering primitives without any graphics library. The animation loop uses requestAnimationFrame for 60fps throughput. A semi-transparent fill each frame creates motion trails without storing particle history — a classic technique that trades accuracy for near-zero memory overhead. Each particle\'s hue shifts proportionally to its speed, giving instant visual feedback on kinetic energy. Mouse forces are computed per-frame using an inverse-square law clamped to prevent instability at close range. All hot-path state lives in refs rather than React state, keeping the component tree from re-rendering on every frame.',
    codeSnippets: [
      {
        title: 'Typed-array particle storage + Δt-scaled physics',
        code: `// Parallel Float32Arrays — one per property, cache-friendly iteration
const _px  = new Float32Array(MAX);
const _pvx = new Float32Array(MAX);
// ...

// Inside RAF tick — force scaled by normalised Δt so simulation
// runs at the same apparent speed regardless of frame rate
const dt   = Math.min((now - prevTime) / 16.667, 2.5);
const f    = Math.min(2400 / (dist * dist), 3.5); // inverse-square, clamped

if (mode === 'attract') {
  _pvx[i] += (dx / dist) * f * 0.045 * dt;
  _pvy[i] += (dy / dist) * f * 0.045 * dt;
} else if (mode === 'orbit') {           // perpendicular tangent → circular drift
  _pvx[i] += ((dy / dist) * f * 0.03 - (dx / dist) * 0.012) * dt;
  _pvy[i] -= ((dx / dist) * f * 0.03 - (dy / dist) * 0.012) * dt;
}

const damp = Math.pow(0.972, dt);        // frame-rate-independent damping
_pvx[i] *= damp;`,
        language: 'typescript'
      },
      {
        title: 'Connection web — proximity graph in O(n²)',
        code: `const CONN_DIST2 = 90 * 90; // compare squared distances — no sqrt needed

if (showConnections) {
  ctx.lineWidth = 0.6;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = _px[i] - _px[j];
      const dy = _py[i] - _py[j];
      const d2 = dx * dx + dy * dy;      // cheap early-out
      if (d2 < CONN_DIST2) {
        const alpha = (1 - Math.sqrt(d2) / 90) * 0.28;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = \`hsl(\${_ph[i]}, 70%, 65%)\`;
        ctx.beginPath();
        ctx.moveTo(_px[i], _py[i]);
        ctx.lineTo(_px[j], _py[j]);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 4,
    title: 'WIP Sandbox',
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
