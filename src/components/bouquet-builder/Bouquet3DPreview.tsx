import React, { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCw, Maximize2, Eye, Sparkles } from 'lucide-react';

interface FlowerMesh {
  id: string;
  color: string;
  position: [number, number, number];
  scale: number;
  petalCount: number;
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

/* ── Animated Particles ── */
const FloatingParticles: React.FC = () => {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const speeds = useMemo(() => Array.from({ length: count }, () => 0.3 + Math.random() * 0.8), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const t = state.clock.elapsedTime * speeds[i];
      const angle = (i / count) * Math.PI * 2 + t * 0.3;
      const r = 1.5 + Math.sin(t * 0.5 + i) * 0.8;
      dummy.position.set(
        Math.cos(angle) * r,
        Math.sin(t + i * 0.5) * 1.5 + 0.5,
        Math.sin(angle) * r
      );
      dummy.scale.setScalar(0.015 + Math.sin(t * 2 + i) * 0.008);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffd4e8"
        emissive="#ff69b4"
        emissiveIntensity={0.6}
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

/* ── Organic Petal ── */
const Petal: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: number;
}> = ({ position, rotation, color, scale }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 10) * 0.001;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[0.18, 12, 8]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.25}
        metalness={0.05}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
        envMapIntensity={1.2}
      />
    </mesh>
  );
};

/* ── Single Flower ── */
const Flower3D: React.FC<{
  position: [number, number, number];
  color: string;
  scale: number;
  petalCount: number;
}> = ({ position, color, scale, petalCount }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0] * 5) * 0.08;
    }
  });

  const petals = useMemo(() => {
    const result: Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      s: number;
    }> = [];
    // Inner ring
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const r = 0.2;
      result.push({
        pos: [Math.cos(angle) * r, 0.05, Math.sin(angle) * r],
        rot: [Math.PI * 0.3, angle, Math.PI * 0.1],
        s: 0.9,
      });
    }
    // Outer ring
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 + Math.PI / petalCount;
      const r = 0.35;
      result.push({
        pos: [Math.cos(angle) * r, -0.02, Math.sin(angle) * r],
        rot: [Math.PI * 0.4, angle, 0],
        s: 1.1,
      });
    }
    return result;
  }, [petalCount]);

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.15}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Petals */}
        {petals.map((p, i) => (
          <Petal key={i} position={p.pos} rotation={p.rot} color={color} scale={p.s} />
        ))}
        {/* Center pistil */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhysicalMaterial
            color="#f5c542"
            roughness={0.2}
            metalness={0.3}
            emissive="#f5a623"
            emissiveIntensity={0.15}
          />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 1, 8]} />
          <meshPhysicalMaterial color="#2d6a4f" roughness={0.5} metalness={0.05} />
        </mesh>
        {/* Leaf */}
        <mesh position={[0.12, -0.35, 0.05]} rotation={[0, 0.3, 0.8]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshPhysicalMaterial color="#40916c" roughness={0.4} metalness={0.05} />
        </mesh>
      </group>
    </Float>
  );
};

/* ── Kraft Wrapping ── */
const Wrapping: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group position={[0, -1.3, 0]}>
      <mesh>
        <coneGeometry args={[1.4, 2.2, 48, 1, true]} />
        <meshPhysicalMaterial
          color={color}
          side={THREE.DoubleSide}
          roughness={0.75}
          metalness={0.02}
          clearcoat={0.1}
        />
      </mesh>
      {/* Wrapping rim highlight */}
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.03, 8, 48]} />
        <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  );
};

/* ── Ribbon ── */
const Ribbon: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group position={[0, -0.25, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.04, 12, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.5}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Bow loops */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.55, 0.1, 0.7]}
          rotation={[0.2, side * 0.3, side * Math.PI * 0.35]}
        >
          <torusGeometry args={[0.2, 0.04, 8, 16, Math.PI]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.15}
            metalness={0.5}
            clearcoat={0.8}
          />
        </mesh>
      ))}
      {/* Ribbon tails */}
      {[-1, 1].map((side) => (
        <mesh
          key={`tail-${side}`}
          position={[side * 0.3, -0.2, 0.72]}
          rotation={[0.1, 0, side * 0.15]}
        >
          <boxGeometry args={[0.12, 0.5, 0.02]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.15}
            metalness={0.5}
            clearcoat={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ── Glass platform ── */
const GlassPlatform: React.FC = () => {
  return (
    <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2, 64]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.15}
        roughness={0}
        metalness={0.1}
        clearcoat={1}
      />
    </mesh>
  );
};

/* ── Scene ── */
const BouquetScene: React.FC<{
  flowers: FlowerMesh[];
  wrappingColor: string;
  ribbonColor: string;
  autoRotate: boolean;
}> = ({ flowers, wrappingColor, ribbonColor, autoRotate }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {flowers.map((flower) => (
          <Flower3D
            key={flower.id}
            position={flower.position}
            color={flower.color}
            scale={flower.scale}
            petalCount={flower.petalCount}
          />
        ))}
        <Wrapping color={wrappingColor} />
        <Ribbon color={ribbonColor} />
      </group>
      <FloatingParticles />
      <GlassPlatform />
      <ContactShadows
        position={[0, -2.49, 0]}
        opacity={0.35}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
};

/* ── Main Component ── */
export const Bouquet3DPreview: React.FC<Bouquet3DPreviewProps> = ({
  flowers,
  wrappingColor = '#d4a574',
  ribbonColor = '#dc2626',
  className = '',
}) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const flowerMeshes: FlowerMesh[] = useMemo(() => {
    const uniqueFlowers = flowers.slice(0, 12);
    return uniqueFlowers.map((flower, index) => {
      const angle = (index / uniqueFlowers.length) * Math.PI * 2;
      const radius = 0.35 + (index % 3) * 0.2;
      const height = 0.1 + Math.random() * 0.4;

      return {
        id: `${flower.id}-${index}`,
        color: flower.color || '#ff69b4',
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        scale: 0.7 + Math.random() * 0.35,
        petalCount: 5 + Math.floor(Math.random() * 3),
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
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm">Add flowers to see 3D preview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`} ref={containerRef}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">3D Preview</CardTitle>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <Eye className="w-3 h-3 mr-0.5" />
              Live
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
            >
              <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            height: isFullscreen ? '100vh' : '20rem',
            background: 'linear-gradient(160deg, hsl(340 10% 12%) 0%, hsl(260 15% 8%) 50%, hsl(200 20% 6%) 100%)',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, ${ribbonColor}33, transparent 70%)`,
            }}
          />
          <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
            <PerspectiveCamera makeDefault position={[0, 0.8, 4.5]} fov={40} />
            <color attach="background" args={['#0a0a0f']} />
            <fog attach="fog" args={['#0a0a0f', 6, 14]} />

            {/* Lighting setup */}
            <ambientLight intensity={0.25} />
            <directionalLight
              position={[4, 6, 4]}
              intensity={1.4}
              castShadow
              shadow-mapSize={[2048, 2048]}
              color="#fff5f0"
            />
            <pointLight position={[-3, 4, -3]} intensity={0.5} color="#e8d0ff" />
            <pointLight position={[0, -1, 3]} intensity={0.3} color="#ffd4e8" />
            <spotLight
              position={[0, 6, 0]}
              angle={0.4}
              penumbra={0.8}
              intensity={0.6}
              color="#ffffff"
            />

            <Suspense fallback={null}>
              <BouquetScene
                flowers={flowerMeshes}
                wrappingColor={wrappingColor}
                ribbonColor={ribbonColor}
                autoRotate={autoRotate}
              />
              <Environment preset="city" environmentIntensity={0.3} />
            </Suspense>

            <OrbitControls
              autoRotate={false}
              enableZoom={true}
              enablePan={false}
              minDistance={2.5}
              maxDistance={8}
              minPolarAngle={Math.PI * 0.15}
              maxPolarAngle={Math.PI * 0.75}
            />
          </Canvas>

          {/* Bottom controls overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <span className="text-[10px] text-white/40 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
              Drag to rotate • Scroll to zoom
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-white/20 text-white/50 bg-black/30 backdrop-blur-sm"
            >
              {flowers.length} flower{flowers.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Bouquet3DPreview;
