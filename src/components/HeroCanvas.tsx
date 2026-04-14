/**
 * HeroCanvas — a floating glass icosahedron rendered with React Three Fiber.
 * Responds to mouse movement with a gentle tilt.
 * Performance: dpr capped at 1.5, simple geometry, no post-processing.
 */
import { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Geometry + Material ─────────────────────────────────────── */
const GlassIcosahedron = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const wireRef  = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (outerRef.current) {
      // Slow base rotation
      outerRef.current.rotation.x = t * 0.07;
      outerRef.current.rotation.y = t * 0.11;
      // Subtle mouse influence (lerped, so it feels smooth)
      outerRef.current.rotation.x += (mouse.y * 0.28 - outerRef.current.rotation.x) * 0.04;
      outerRef.current.rotation.y += (mouse.x * 0.28 - outerRef.current.rotation.y) * 0.04;
    }

    if (wireRef.current) {
      // Slightly different speed → depth cue
      wireRef.current.rotation.x = t * 0.045 - mouse.y * 0.06;
      wireRef.current.rotation.y = t * 0.135 + mouse.x * 0.06;
    }
  });

  return (
    <Float speed={1.3} floatIntensity={0.4} rotationIntensity={0}>
      <group>
        {/* Main glass mesh */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[1.18, 1]} />
          <meshPhysicalMaterial
            color={new THREE.Color('#4F9EFF')}
            transmission={0.62}
            thickness={2.2}
            roughness={0.04}
            metalness={0.06}
            ior={1.5}
            transparent
            opacity={0.88}
            emissive={new THREE.Color('#1D3D8A')}
            emissiveIntensity={0.22}
          />
        </mesh>

        {/* Wireframe shell — slightly larger, contrasting opacity */}
        <mesh ref={wireRef} scale={1.065}>
          <icosahedronGeometry args={[1.18, 1]} />
          <meshBasicMaterial
            color={new THREE.Color('#93C5FD')}
            wireframe
            transparent
            opacity={0.13}
          />
        </mesh>

        {/* Backlit glow blob */}
        <mesh scale={1.55}>
          <sphereGeometry args={[1.18, 6, 6]} />
          <meshBasicMaterial
            color={new THREE.Color('#3B82F6')}
            transparent
            opacity={0.03}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </Float>
  );
};

/* ─── Orbiting light ─────────────────────────────────────────── */
const OrbitingLight = ({
  radius,
  speed,
  color,
  intensity,
  yOffset = 0,
}: {
  radius: number;
  speed: number;
  color: string;
  intensity: number;
  yOffset?: number;
}) => {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = yOffset + Math.sin(t * 0.7) * 0.8;
    }
  });
  return <pointLight ref={ref} color={color} intensity={intensity} />;
};

/* ─── Canvas wrapper ─────────────────────────────────────────── */
const HeroCanvas = () => (
  <Canvas
    camera={{ position: [0, 0, 4.6], fov: 44 }}
    dpr={[1, 1.5]}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    style={{ width: '100%', height: '100%' }}
  >
    <Suspense fallback={null}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[0, 8, 4]} intensity={0.6} color="#E0EEFF" />

      {/* Dynamic orbiting lights give the glass material life */}
      <OrbitingLight radius={3.5} speed={0.4}  color="#3B82F6" intensity={5}   yOffset={1}  />
      <OrbitingLight radius={3}   speed={-0.3} color="#7C3AED" intensity={3.5} yOffset={-1} />
      <OrbitingLight radius={4}   speed={0.25} color="#0EA5E9" intensity={2.5} yOffset={0}  />

      <GlassIcosahedron />
    </Suspense>
  </Canvas>
);

export default HeroCanvas;
