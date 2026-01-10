import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface FlowerMesh {
  id: string;
  color: string;
  position: [number, number, number];
  scale: number;
}

interface Bouquet3DPreviewProps {
  flowers: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  wrappingColor?: string;
  ribbonColor?: string;
  className?: string;
}

// Individual flower component
const Flower: React.FC<{ position: [number, number, number]; color: string; scale: number }> = ({
  position,
  color,
  scale,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position} scale={scale}>
        {/* Flower petals */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <mesh
            key={i}
            ref={i === 0 ? meshRef : undefined}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.3,
              0.1,
              Math.sin((angle * Math.PI) / 180) * 0.3,
            ]}
            rotation={[Math.PI * 0.25, (angle * Math.PI) / 180, 0]}
          >
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
        {/* Flower center */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 1, 8]} />
          <meshStandardMaterial color="#228b22" roughness={0.6} />
        </mesh>
      </group>
    </Float>
  );
};

// Wrapping paper component
const Wrapping: React.FC<{ color: string }> = ({ color }) => {
  return (
    <mesh position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
      <coneGeometry args={[1.5, 2, 32, 1, true]} />
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

// Ribbon component
const Ribbon: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh>
        <torusGeometry args={[0.8, 0.05, 8, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Ribbon bow */}
      <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI * 0.25]}>
        <boxGeometry args={[0.4, 0.1, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0.9, 0.15, 0]} rotation={[0, 0, Math.PI * 0.4]}>
        <boxGeometry args={[0.3, 0.08, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
};

// Main bouquet scene
const BouquetScene: React.FC<{
  flowers: FlowerMesh[];
  wrappingColor: string;
  ribbonColor: string;
}> = ({ flowers, wrappingColor, ribbonColor }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {flowers.map((flower) => (
        <Flower
          key={flower.id}
          position={flower.position}
          color={flower.color}
          scale={flower.scale}
        />
      ))}
      <Wrapping color={wrappingColor} />
      <Ribbon color={ribbonColor} />
    </group>
  );
};

export const Bouquet3DPreview: React.FC<Bouquet3DPreviewProps> = ({
  flowers,
  wrappingColor = '#d4a574',
  ribbonColor = '#dc2626',
  className = '',
}) => {
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const flowerMeshes: FlowerMesh[] = useMemo(() => {
    const uniqueFlowers = flowers.slice(0, 12);
    return uniqueFlowers.map((flower, index) => {
      const angle = (index / uniqueFlowers.length) * Math.PI * 2;
      const radius = 0.4 + Math.random() * 0.3;
      const height = Math.random() * 0.5;
      
      return {
        id: `${flower.id}-${index}`,
        color: flower.color || '#ff69b4',
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        scale: 0.8 + Math.random() * 0.4,
      };
    });
  }, [flowers]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (flowers.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          Add flowers to see 3D preview
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} ref={containerRef}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">3D Preview</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
            >
              <RotateCw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={45} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffddff" />
            <Suspense fallback={null}>
              <BouquetScene
                flowers={flowerMeshes}
                wrappingColor={wrappingColor}
                ribbonColor={ribbonColor}
              />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enableZoom={true}
              enablePan={false}
              minDistance={2}
              maxDistance={8}
              minPolarAngle={Math.PI * 0.2}
              maxPolarAngle={Math.PI * 0.8}
            />
          </Canvas>
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Drag to rotate • Scroll to zoom
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Bouquet3DPreview;
