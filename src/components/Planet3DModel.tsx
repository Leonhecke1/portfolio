import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei'; // Import Html for text fallback
import { Mesh } from 'three';
import { TextureLoader } from 'three'; // Import TextureLoader directly for manual loading

interface Planet3DModelProps {
  textureUrl: string;
  size?: number; // Diameter of the sphere
  rotationSpeed?: number; // Speed of rotation
}

const Planet3DModel: React.FC<Planet3DModelProps> = ({ textureUrl, size = 1, rotationSpeed = 0.005 }) => {
  const meshRef = useRef<Mesh>(null);
  const [texture, setTexture] = useState<any>(null); // Use 'any' for texture type for now
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Manually load texture to have more control over error handling
  React.useEffect(() => {
    setLoading(true);
    setError(false);
    if (!textureUrl) {
      setError(true);
      setLoading(false);
      return;
    }

    const loader = new TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        setTexture(loadedTexture);
        setLoading(false);
      },
      undefined, // onProgress callback (optional)
      (err) => {
        console.error(`Failed to load texture ${textureUrl}:`, err);
        setError(true);
        setLoading(false);
      }
    );
  }, [textureUrl]);


  useFrame(() => {
    if (meshRef.current && !loading && !error) { // Only rotate if loaded successfully
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <Sphere args={[size, 64, 64]} ref={meshRef}>
      {error ? (
        <meshStandardMaterial color="gray" /> // Fallback color for error
      ) : (
        texture && <meshStandardMaterial map={texture} /> // Render with texture if loaded
      )}
      {loading && ( // Display loading message above the sphere
        <Html position={[0, size + 0.5, 0]}>
          <div style={{ color: 'white', fontSize: '10px', whiteSpace: 'nowrap' }}>Loading...</div>
        </Html>
      )}
       {error && !loading && ( // Display error message if failed to load
        <Html position={[0, size + 0.5, 0]}>
          <div style={{ color: 'red', fontSize: '10px', whiteSpace: 'nowrap' }}>Error!</div>
        </Html>
      )}
    </Sphere>
  );
};

interface PlanetCanvasProps {
  textureUrl: string;
  size?: number;
  rotationSpeed?: number;
}

const PlanetCanvas: React.FC<PlanetCanvasProps> = (props) => {
  return (
    <div className="planet-3d-model-container">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Planet3DModel {...props} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default PlanetCanvas;