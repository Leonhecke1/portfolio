import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float, Billboard, Text, Trail } from '@react-three/drei';
import { useTheme, THEME } from '../../contexts/MissionControlContext';
import * as THREE from 'three';

// Custom Warp Stars Shader
class WarpMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uWarpFactor: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uWarpFactor;
        varying vec2 vUv;
        varying float vDistance;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Warp effect - stretch stars based on warp factor
          float stretch = 1.0 + uWarpFactor * 10.0;
          pos.z *= stretch;

          // Add radial blur effect
          float dist = length(pos.xy);
          vDistance = dist;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uWarpFactor;
        varying vec2 vUv;
        varying float vDistance;

        void main() {
          // Create streak effect
          vec2 center = vUv - 0.5;
          float dist = length(center);

          float alpha = smoothstep(0.5, 0.0, dist);
          alpha *= (1.0 + uWarpFactor * 2.0);

          // Color shift during warp
          vec3 color = mix(
            vec3(0.0, 0.95, 1.0),
            vec3(0.44, 0.0, 1.0),
            uWarpFactor
          );

          gl_FragColor = vec4(color, alpha * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
}

// Warp Streaks Component
const WarpStreaks: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { warpFactor } = useTheme();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uWarpFactor.value = warpFactor;
    }
  });

  const streaks = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        -50 - Math.random() * 50,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <>
      {streaks.map((streak, i) => (
        <mesh key={i} position={streak.position} scale={[streak.scale, 0.02, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={warpFactor > 0.5 ? THEME.mutedPurple : THEME.turquoise}
            transparent
            opacity={0.3 + warpFactor * 0.5}
          />
        </mesh>
      ))}
    </>
  );
};

// Waypoint Node - The Star Map navigation points
interface WaypointProps {
  position: [number, number, number];
  id: string;
  label: string;
  description: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const Waypoint: React.FC<WaypointProps> = ({
  position,
  id,
  label,
  description,
  color,
  isActive,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
    }
  });

  const scale = hovered || isActive ? 1.3 : 1;
  const glowIntensity = hovered || isActive ? 1 : 0.5;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <group position={position}>
        {/* Main sphere */}
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={scale}
        >
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={glowIntensity}
            metalness={0.8}
            roughness={0.2}
            wireframe={!isActive}
          />
        </mesh>

        {/* Outer ring */}
        <mesh ref={ringRef} scale={scale * 1.5}>
          <torusGeometry args={[0.6, 0.02, 8, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered || isActive ? 0.8 : 0.3}
          />
        </mesh>

        {/* Glow sphere */}
        <mesh scale={scale * 2}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
          />
        </mesh>

        {/* Point light */}
        <pointLight color={color} intensity={glowIntensity} distance={3} />

        {/* Label billboard */}
        <Billboard position={[0, -1, 0]}>
          <Text
            fontSize={0.15}
            color={isActive ? THEME.turquoise : '#7a9eb8'}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpmIyXjU1pg.woff2"
          >
            {label}
          </Text>
          <Text
            fontSize={0.08}
            color="#e0f7ff80"
            anchorX="center"
            anchorY="middle"
            position={[0, -0.15, 0]}
          >
            {description}
          </Text>
        </Billboard>
      </group>
    </Float>
  );
};

// Project visualization as wireframe polyhedrons
interface ProjectVizProps {
  position: [number, number, number];
  project: {
    title: string;
    tech: string[];
  };
}

const ProjectViz: React.FC<ProjectVizProps> = ({ position, project }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const techHash = project.tech.join('').length;
  const geometryType = techHash % 4;

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
      <group position={position}>
        <mesh ref={meshRef}>
          {geometryType === 0 && <octahedronGeometry args={[0.5, 0]} />}
          {geometryType === 1 && <dodecahedronGeometry args={[0.5, 0]} />}
          {geometryType === 2 && <icosahedronGeometry args={[0.5, 0]} />}
          {geometryType === 3 && <torusKnotGeometry args={[0.3, 0.1, 64, 8]} />}
          <meshBasicMaterial
            color={THEME.turquoise}
            wireframe
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Inner glow */}
        <mesh scale={0.8}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={THEME.mutedPurple}
            emissive={THEME.mutedPurple}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
};

// Floating data particles
const DataParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorPalette = [
      new THREE.Color(THEME.turquoise),
      new THREE.Color(THEME.mutedPurple),
      new THREE.Color(THEME.teal),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Main 3D Scene
const MissionScene: React.FC = () => {
  const { activeSector, setActiveSector, warpFactor } = useTheme();
  const { camera } = useThree();

  const waypoints = [
    {
      id: 'home',
      position: [0, 0, 0] as [number, number, number],
      label: 'COMMAND',
      description: 'Mission Control',
      color: THEME.turquoise,
    },
    {
      id: 'about',
      position: [-8, 2, -5] as [number, number, number],
      label: 'BRIEFING',
      description: 'Profile Data',
      color: THEME.teal,
    },
    {
      id: 'projects',
      position: [8, 2, -5] as [number, number, number],
      label: 'OPERATIONS',
      description: 'Mission Logs',
      color: THEME.darkBlue,
    },
    {
      id: 'contact',
      position: [0, -4, -3] as [number, number, number],
      label: 'COMMS',
      description: 'Establish Link',
      color: THEME.mutedPurple,
    },
  ];

  const projects = [
    { title: 'Planetary Dashboard', tech: ['React', 'Three.js', 'NASA API'] },
    { title: 'Project Delta', tech: ['React', 'TypeScript', 'DnD'] },
    { title: 'Space Portfolio', tech: ['React', 'Three.js', 'WebGL'] },
  ];

  // Camera transition based on active sector
  useEffect(() => {
    const targetWaypoint = waypoints.find(w => w.id === activeSector);
    if (targetWaypoint) {
      const targetPos = new THREE.Vector3(
        targetWaypoint.position[0] * 0.5,
        targetWaypoint.position[1] * 0.5 + 2,
        8 + targetWaypoint.position[2] * 0.3
      );

      // Animate camera
      const startPos = camera.position.clone();
      const duration = 1500;
      const startTime = Date.now();

      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        camera.position.lerpVectors(startPos, targetPos, eased);

        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };

      animateCamera();
    }
  }, [activeSector, camera, waypoints]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color={THEME.turquoise} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color={THEME.mutedPurple} />
      <spotLight
        position={[0, 10, 5]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Background */}
      <Stars
        radius={100}
        depth={50}
        count={6000}
        factor={4}
        saturation={0}
        fade
        speed={0.5 + warpFactor * 2}
      />
      <Sparkles
        count={300}
        scale={30}
        size={2}
        speed={0.3 + warpFactor}
        color={THEME.turquoise}
      />

      {/* Warp streaks effect */}
      <WarpStreaks />

      {/* Data particles */}
      <DataParticles />

      {/* Waypoints - The Star Map */}
      {waypoints.map((waypoint) => (
        <Waypoint
          key={waypoint.id}
          position={waypoint.position}
          id={waypoint.id}
          label={waypoint.label}
          description={waypoint.description}
          color={waypoint.color}
          isActive={activeSector === waypoint.id}
          onClick={() => setActiveSector(waypoint.id)}
        />
      ))}

      {/* Project visualizations in the projects sector */}
      {activeSector === 'projects' && projects.map((project, i) => (
        <ProjectViz
          key={project.title}
          position={[
            -3 + i * 3,
            -1 + Math.sin(i) * 0.5,
            -8
          ]}
          project={project}
        />
      ))}

      {/* Orbit Controls - disabled during warp for dramatic effect */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={20}
        autoRotate={activeSector === 'home'}
        autoRotateSpeed={0.3}
        enabled={warpFactor < 0.5}
      />
    </>
  );
};

export default MissionScene;
