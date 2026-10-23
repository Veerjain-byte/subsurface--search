import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSearchStore } from '../store/useSearchStore';

interface CardPlaqueProps {
  position: [number, number, number];
  rotation: [number, number, number];
  score: number;
  index: number;
}

const SinglePlaque3D: React.FC<CardPlaqueProps> = ({ position, rotation, score, index }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + index * 0.9;
      // Gentle bobbing and tilt
      meshRef.current.position.y = position[1] + Math.sin(t * 1.4) * 0.15;
      meshRef.current.rotation.z = rotation[2] + Math.sin(t * 1.1) * 0.03;
      meshRef.current.rotation.x = rotation[0] + Math.cos(t * 0.8) * 0.02;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Translucent Frosted Glass Plaque Body */}
      <mesh>
        <boxGeometry args={[4.2, 2.6, 0.08]} />
        <meshPhysicalMaterial
          color="#0d3a44"
          emissive="#0d4653"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Cyan Glowing Hairline Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.22, 2.62, 0.09)]} />
        <lineBasicMaterial color="#64e3da" transparent opacity={0.65} />
      </lineSegments>

      {/* Floating Relevance Score Bar in 3D */}
      <group position={[0, 0.95, 0.05]}>
        {/* Track */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 0.08]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
        {/* Progress fill */}
        <mesh position={[-1.6 + (3.2 * score) / 2, 0, 0.01]}>
          <planeGeometry args={[3.2 * score, 0.08]} />
          <meshBasicMaterial color="#64e3da" />
        </mesh>
      </group>

      {/* Accent Corner Notches */}
      {[
        [-2.0, 1.2],
        [2.0, 1.2],
        [-2.0, -1.2],
        [2.0, -1.2],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.06]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#ffa459" />
        </mesh>
      ))}
    </group>
  );
};

export const FloatingResultCards3D: React.FC = () => {
  const results = useSearchStore((s) => s.results);
  const isSearching = useSearchStore((s) => s.isSearching);

  if (isSearching || results.length === 0) return null;

  const cardLayout: Array<{
    pos: [number, number, number];
    rot: [number, number, number];
  }> = [
    { pos: [-4.2, -8.6, 0.2], rot: [0.08, 0.22, -0.04] },
    { pos: [0.0, -8.4, -0.8], rot: [0.02, 0.0, 0.0] },
    { pos: [4.2, -8.8, 0.2], rot: [0.08, -0.22, 0.04] },
    { pos: [-2.6, -11.2, 0.8], rot: [-0.06, 0.14, -0.02] },
    { pos: [2.6, -11.4, 0.8], rot: [-0.06, -0.14, 0.02] },
  ];

  return (
    <group position={[0, 0, 0]}>
      {results.slice(0, 5).map((doc, idx) => {
        const layout = cardLayout[idx] || {
          pos: [((idx % 3) - 1) * 3.8, -9 - Math.floor(idx / 3) * 2.8, 0],
          rot: [0, 0, 0],
        };
        return (
          <SinglePlaque3D
            key={doc.id}
            position={layout.pos}
            rotation={layout.rot}
            score={Math.min(1, Math.max(0.1, doc.score))}
            index={idx}
          />
        );
      })}
    </group>
  );
};
