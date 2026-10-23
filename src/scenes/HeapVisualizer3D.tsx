import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HeapNodeVisual {
  id: number;
  value: number;
  label: string;
  pos: [number, number, number];
  isHighlighted?: boolean;
}

export const HeapVisualizer3D: React.FC = () => {
  const [heapData, setHeapData] = useState<number[]>([12, 19, 24, 38, 45, 52, 60]);
  const [swappingPair, setSwappingPair] = useState<[number, number] | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Compute 3D tree coordinates for 7 nodes (binary heap)
  // Root at Y = -16, Level 1 at Y = -17.5, Level 2 at Y = -19
  const treePositions: Array<[number, number, number]> = [
    [0, -16.0, -1.0],      // 0: Root (min)
    [-2.2, -17.5, -0.5],   // 1: Left child
    [2.2, -17.5, -0.5],    // 2: Right child
    [-3.3, -19.0, 0.0],    // 3: Left-Left
    [-1.1, -19.0, 0.0],    // 4: Left-Right
    [1.1, -19.0, 0.0],     // 5: Right-Left
    [3.3, -19.0, 0.0],     // 6: Right-Right
  ];

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating sway
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Node Bubbles */}
      {heapData.map((val, idx) => {
        const pos = treePositions[idx];
        const isSwapping = swappingPair && (swappingPair[0] === idx || swappingPair[1] === idx);

        return (
          <group key={idx} position={pos}>
            {/* Glowing translucent bubble sphere */}
            <mesh>
              <sphereGeometry args={[0.42, 24, 24]} />
              <meshStandardMaterial
                color={idx === 0 ? '#ffa459' : isSwapping ? '#ff4d36' : '#64e3da'}
                emissive={idx === 0 ? '#ff8d29' : isSwapping ? '#ff4d36' : '#26b5bb'}
                emissiveIntensity={0.8}
                roughness={0.2}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Bubble rim */}
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <ringGeometry args={[0.48, 0.52, 32]} />
              <meshBasicMaterial
                color={idx === 0 ? '#ffb273' : '#64e3da'}
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Connection Links (Lines between parent and child nodes) */}
      {[
        [0, 1],
        [0, 2],
        [1, 3],
        [1, 4],
        [2, 5],
        [2, 6],
      ].map(([parentIdx, childIdx], linkIdx) => {
        const p1 = treePositions[parentIdx];
        const p2 = treePositions[childIdx];
        const mid: [number, number, number] = [
          (p1[0] + p2[0]) / 2,
          (p1[1] + p2[1]) / 2,
          (p1[2] + p2[2]) / 2,
        ];
        const length = Math.sqrt(
          Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[2] - p1[2], 2)
        );

        return (
          <group key={linkIdx} position={mid}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, length, 8]} />
              <meshBasicMaterial color="#64e3da" transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
