import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSearchStore } from '../store/useSearchStore';
import { simulateHashCollisions } from '../utils/searchMath';

export const HashTableStones3D: React.FC = () => {
  const hashTableMode = useSearchStore((s) => s.hashTableMode);

  // Sample keys representing inverted index dictionary terms
  const sampleKeys = useMemo(
    () => [
      'query', 'posting', 'bm25', 'heap', 'btree', 'mmap', 'simd', 'vector',
      'tfidf', 'cache', 'token', 'stem', 'index', 'branchless', 'concurrency'
    ],
    []
  );

  const bucketCount = 12;

  const { buckets, totalCollisions } = useMemo(() => {
    return simulateHashCollisions(sampleKeys, bucketCount, hashTableMode);
  }, [sampleKeys, hashTableMode]);

  // Arrange buckets in an arc on the seabed at Y = -21.8
  const bucketPositions = useMemo(() => {
    const radius = 6.5;
    return buckets.map((_, i) => {
      const angle = (i / bucketCount) * Math.PI * 1.5 - Math.PI * 0.75;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * (radius * 0.7) - 3;
      return { x, z, angle };
    });
  }, [bucketCount, buckets]);

  return (
    <group position={[0, -21.8, 0]}>
      {buckets.map((bucket, i) => {
        const pos = bucketPositions[i];
        const hasCollision = bucket.keys.length > 1;
        const stoneColor = hasCollision ? '#d33c2a' : bucket.keys.length > 0 ? '#26b5bb' : '#1e293b';

        return (
          <group key={i} position={[pos.x, 0, pos.z]}>
            {/* The Bucket Stone */}
            <mesh position={[0, 0.25, 0]} scale={[0.8, 0.4, 0.8]}>
              <dodecahedronGeometry args={[0.7, 1]} />
              <meshStandardMaterial
                color={stoneColor}
                roughness={0.8}
                metalness={0.2}
                emissive={hasCollision ? '#ff4d36' : bucket.keys.length > 0 ? '#1b8b91' : '#000000'}
                emissiveIntensity={hasCollision ? 0.8 : bucket.keys.length > 0 ? 0.4 : 0}
              />
            </mesh>

            {/* Linked Orbs for Chaining or Probed Items */}
            {bucket.keys.map((keyName, kIdx) => (
              <group key={keyName} position={[0, 0.8 + kIdx * 0.65, 0]}>
                <mesh>
                  <sphereGeometry args={[0.22, 16, 16]} />
                  <meshStandardMaterial
                    color={hasCollision ? '#ff8d7a' : '#64e3da'}
                    emissive={hasCollision ? '#ff5a43' : '#64e3da'}
                    emissiveIntensity={0.6}
                    roughness={0.3}
                  />
                </mesh>
                {/* Connecting stem/chain to previous orb or stone */}
                <mesh position={[0, -0.32, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
                  <meshStandardMaterial color="#64e3da" transparent opacity={0.4} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};
