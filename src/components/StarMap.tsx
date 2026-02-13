import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme, THEME } from '../contexts/MissionControlContext';

// Enhanced Warp Stars with new palette
const WarpStars: React.FC<{ warpFactor: number }> = ({ warpFactor }) => {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (starsRef.current && warpFactor > 0) {
      const material = starsRef.current.material as THREE.PointsMaterial;
      material.size = 0.1 + warpFactor * 0.3;
      (starsRef.current as any).rotation.z = state.clock.elapsedTime * warpFactor * 0.5;
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={120}
      depth={80}
      count={warpFactor > 0 ? 8000 : 5000}
      factor={warpFactor > 0 ? 8 : 3}
      saturation={0.1}
      fade
      speed={0.3 + warpFactor * 3}
    />
  );
};

// Waypoint - Now purely visual, non-interactive marker
interface WaypointProps {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
  color: string;
  isActive: boolean;
  mousePos?: MousePosition;
}

const Waypoint: React.FC<WaypointProps> = ({
  position,
  color,
  isActive,
  mousePos = { x: 0, y: 0 }
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const scale = isActive ? 1.6 : 0.8;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.08);
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.5;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (isActive ? 1.5 : 0.3);
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * (isActive ? 2 : 0.6);
    }

    // Enhanced parallax offset
    if (groupRef.current && !isActive) {
      const parallaxX = mousePos.x * 0.1;
      const parallaxY = mousePos.y * 0.1;
      groupRef.current.position.x = position[0] + parallaxX;
      groupRef.current.position.y = position[1] + parallaxY;
    }
  });

  const activeColor = isActive ? THEME.sandGold : color;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={position}>
        {/* Main icosahedron - Purely visual marker */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial
            color={activeColor}
            emissive={activeColor}
            emissiveIntensity={isActive ? 1.2 : 0.2}
            metalness={0.9}
            roughness={0.1}
            wireframe={!isActive}
            transparent
            opacity={isActive ? 1 : 0.6}
          />
        </mesh>

        {/* Outer ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.015, 8, 48]} />
          <meshBasicMaterial color={activeColor} transparent opacity={isActive ? 0.8 : 0.15} />
        </mesh>

        {/* Inner ring */}
        <mesh ref={innerRingRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.5, 0.01, 8, 48]} />
          <meshBasicMaterial color={activeColor} transparent opacity={isActive ? 0.6 : 0.1} />
        </mesh>

        {/* Ambient glow sphere */}
        <mesh scale={isActive ? 3 : 1.5}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color={activeColor} transparent opacity={isActive ? 0.12 : 0.04} />
        </mesh>

        {/* Point light - Stronger for active */}
        <pointLight
          color={activeColor}
          intensity={isActive ? 3 : 0.3}
          distance={isActive ? 6 : 3}
        />
      </group>
    </Float>
  );
};

// Connection lines between waypoints using new palette
const ConstellationLines: React.FC<{ waypoints: any[]; activeWaypoint: string }> = ({ waypoints, activeWaypoint }) => {
  const activeIndex = waypoints.findIndex(w => w.id === activeWaypoint);

  return (
    <>
      {waypoints.map((waypoint, index) => {
        if (index >= waypoints.length - 1) return null;

        const nextWaypoint = waypoints[index + 1];
        const isConnected = index <= activeIndex;

        return (
          <line key={`line-${index}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  ...waypoint.position,
                  ...nextWaypoint.position
                ]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={isConnected ? THEME.turquoise : '#1a1a2e'}
              transparent
              opacity={isConnected ? 0.4 : 0.06}
              linewidth={1}
            />
          </line>
        );
      })}
    </>
  );
};

// Mouse tracking state
interface MousePosition {
  x: number;
  y: number;
}

// Floating nebula particles with enhanced parallax
const NebulaParticles: React.FC<{ mousePos: MousePosition }> = ({ mousePos }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color(THEME.turquoise),
      new THREE.Color(THEME.mutedPurple),
      new THREE.Color(THEME.darkBlue),
      new THREE.Color(THEME.teal),
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 12 + Math.random() * 25;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      // Enhanced parallax with mouse tracking
      const parallaxX = mousePos.x * 0.3;
      const parallaxY = mousePos.y * 0.3;

      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015 + parallaxX;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05 + parallaxY;
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
        size={0.04}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Camera Controller with smooth cinematic transitions
const CameraController: React.FC<{
  targetPosition: [number, number, number];
  warpFactor: number;
  mousePos: MousePosition;
}> = ({ targetPosition, warpFactor, mousePos }) => {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());

  useFrame(() => {
    // Enhanced 3D parallax on camera - subtle for smooth experience
    const parallaxStrength = warpFactor > 0 ? 0 : 0.5;
    const parallaxX = mousePos.x * parallaxStrength;
    const parallaxY = mousePos.y * parallaxStrength;

    // Smooth cinematic camera movement with easing
    const lerpSpeed = warpFactor > 0 ? 0.08 : 0.03;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPosition[0] + parallaxX, lerpSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPosition[1] + parallaxY, lerpSpeed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPosition[2] - warpFactor * 5, lerpSpeed);

    // Smooth lookAt with interpolation
    targetRef.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    camera.lookAt(targetRef.current);

    // Dynamic FOV for cinematic feel
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFOV = warpFactor > 0 ? 75 : 60;
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

// Main Scene
const StarMap: React.FC = () => {
  const { activeSector, warpFactor } = useTheme();
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  // Enhanced mouse tracking for immersive parallax
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const waypoints = useMemo(() => [
    {
      id: 'home',
      position: [0, 0, 0] as [number, number, number],
      label: 'COMMAND',
      description: 'Mission Control',
      color: THEME.turquoise,
    },
    {
      id: 'about',
      position: [-8, 2, -4] as [number, number, number],
      label: 'BRIEFING',
      description: 'Personnel File',
      color: THEME.teal,
    },
    {
      id: 'projects',
      position: [8, 2, -4] as [number, number, number],
      label: 'OPERATIONS',
      description: 'Mission Logs',
      color: THEME.darkBlue,
    },
    {
      id: 'contact',
      position: [0, -3, -6] as [number, number, number],
      label: 'COMMS',
      description: 'Establish Link',
      color: THEME.mutedPurple,
    },
  ], []);

  const currentWaypoint = waypoints.find(w => w.id === activeSector) || waypoints[0];

  // Camera target with 60/40 split - offset to right so planet sits at 60% screen width
  // This leaves 40% of screen space clear on the left for text panels
  const cameraOffset = activeSector === 'home' ? 0 : -2.5;
  const cameraTarget: [number, number, number] = [
    currentWaypoint.position[0] + cameraOffset,
    currentWaypoint.position[1],
    currentWaypoint.position[2]
  ];

  return (
    <>
      {/* Lighting — warm tones */}
      <ambientLight intensity={0.12} />
      <pointLight position={[20, 15, 20]} intensity={0.6} color={THEME.turquoise} />
      <pointLight position={[-15, -10, -15]} intensity={0.3} color={THEME.mutedPurple} />
      <pointLight position={[0, 10, 5]} intensity={0.2} color={THEME.sandGold} />

      {/* Deep starfield background */}
      <WarpStars warpFactor={warpFactor} />
      <Sparkles
        count={250}
        scale={40}
        size={1.5}
        speed={0.2}
        color={THEME.turquoise}
        opacity={0.4}
      />
      <Sparkles
        count={100}
        scale={30}
        size={2}
        speed={0.15}
        color={THEME.sandGold}
        opacity={0.2}
      />

      {/* Nebula particles */}
      <NebulaParticles mousePos={mousePos} />

      {/* Connection lines */}
      <ConstellationLines waypoints={waypoints} activeWaypoint={activeSector} />

      {/* Waypoints - Purely visual markers, non-interactive */}
      {waypoints.map((waypoint) => (
        <Waypoint
          key={waypoint.id}
          id={waypoint.id}
          position={waypoint.position}
          label={waypoint.label}
          description={waypoint.description}
          color={waypoint.color}
          isActive={activeSector === waypoint.id}
          mousePos={mousePos}
        />
      ))}

      {/* Camera Controller */}
      <CameraController targetPosition={cameraTarget} warpFactor={warpFactor} mousePos={mousePos} />

      {/* Controls - Smooth cinematic movement only */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={activeSector === 'home'}
        minDistance={3}
        maxDistance={18}
        autoRotate={activeSector === 'home' && warpFactor === 0}
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
};

export default StarMap;
