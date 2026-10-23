import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CausticShaderMaterial } from '../shaders/causticShader';
import { useSearchStore } from '../store/useSearchStore';
import { currentSkyState } from '../config/skyPalette';

export const UnderwaterScene: React.FC = () => {
  const quality = useSearchStore((s) => s.quality);
  const causticMatRef = useRef<THREE.ShaderMaterial>(null);
  const kelpGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const underwaterAmbientRef = useRef<THREE.AmbientLight>(null);
  const shaftLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightMidRef = useRef<THREE.PointLight>(null);
  const pointLightFloorRef = useRef<THREE.PointLight>(null);

  // Particle count adapted to quality preset
  const particleCount = quality === 'high' ? 350 : quality === 'medium' ? 180 : 80;

  // Particle positions strictly below the waterline (Y < -0.8)
  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = -21.5 + Math.random() * 20.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 28;
      spd[i] = 0.12 + Math.random() * 0.28;
    }
    return { positions: pos, speeds: spd };
  }, [particleCount]);

  useFrame((state, delta) => {
    const palette = currentSkyState;

    // Dynamic underwater illumination scaling with sun elevation & time
    if (causticMatRef.current) {
      causticMatRef.current.uniforms.uTime.value += delta;
      causticMatRef.current.uniforms.uIntensity.value = palette.causticIntensity;
    }

    if (underwaterAmbientRef.current) {
      underwaterAmbientRef.current.intensity = palette.underwaterAmbientIntensity;
    }

    if (shaftLightRef.current) {
      shaftLightRef.current.intensity = palette.underwaterShaftIntensity;
    }

    if (pointLightMidRef.current) {
      pointLightMidRef.current.intensity = 1.0 + palette.underwaterShaftIntensity * 0.8;
    }

    if (pointLightFloorRef.current) {
      // At night, subtle bioluminescent glow
      pointLightFloorRef.current.intensity = 1.2 + palette.causticIntensity * 1.0;
    }

    // Swaying kelp columns
    if (kelpGroupRef.current) {
      const t = state.clock.elapsedTime;
      kelpGroupRef.current.children.forEach((child, idx) => {
        child.rotation.z = Math.sin(t * 1.2 + idx * 0.8) * 0.08;
        child.rotation.x = Math.cos(t * 0.9 + idx * 0.5) * 0.06;
      });
    }

    // Drifting rising bubbles/particles (slow, gentle motion strictly below waterline)
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += speeds[i] * delta * 0.5;
        arr[i * 3 + 0] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;

        if (arr[i * 3 + 1] >= -0.8) {
          arr[i * 3 + 1] = -21.5;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Underwater Ambient & Soft Cyan Point Lights */}
      <ambientLight ref={underwaterAmbientRef} color="#0d4653" intensity={0.9} />
      
      {/* Surface Light Shaft into the deep */}
      <directionalLight
        ref={shaftLightRef}
        position={[0, 4, 0]}
        color="#64e3da"
        intensity={1.2}
      />
      <pointLight ref={pointLightMidRef} position={[0, -10, 2]} color="#26b5bb" intensity={1.8} distance={20} />
      <pointLight ref={pointLightFloorRef} position={[0, -18, 0]} color="#64e3da" intensity={2.2} distance={15} />

      {/* --- DRIFTING KELP-LIKE COLUMNS --- */}
      <group ref={kelpGroupRef}>
        {[
          { x: -7, z: -4, h: 14, scale: 0.9 },
          { x: -5, z: 2, h: 11, scale: 0.75 },
          { x: 6, z: -5, h: 16, scale: 1.1 },
          { x: 8, z: 1, h: 13, scale: 0.85 },
          { x: -9, z: -8, h: 18, scale: 1.2 },
          { x: 9, z: -10, h: 15, scale: 1.0 },
          { x: -2, z: -12, h: 12, scale: 0.8 },
          { x: 3, z: -11, h: 14, scale: 0.95 },
        ].map((kelp, idx) => (
          <group key={idx} position={[kelp.x, -22, kelp.z]}>
            <mesh position={[0, kelp.h / 2, 0]}>
              <cylinderGeometry args={[0.08 * kelp.scale, 0.18 * kelp.scale, kelp.h, 8, 8]} />
              <meshStandardMaterial
                color="#0f5953"
                emissive="#0d3a37"
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>
            {[0.25, 0.5, 0.75, 0.9].map((ratio, fIdx) => (
              <mesh
                key={fIdx}
                position={[
                  Math.sin(fIdx * 1.5) * 0.4,
                  kelp.h * ratio,
                  Math.cos(fIdx * 1.5) * 0.4,
                ]}
                rotation={[0.3, fIdx * 1.2, 0.4]}
              >
                <boxGeometry args={[0.8 * kelp.scale, 0.05, 0.25 * kelp.scale]} />
                <meshStandardMaterial color="#1a756b" roughness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* --- SEABED ROCKS (Scattered at floor Y = -22) --- */}
      {[
        { pos: [-4, -21.4, -2], s: 1.6 },
        { pos: [5, -21.2, 3], s: 2.1 },
        { pos: [-7, -21.5, 4], s: 1.4 },
        { pos: [8, -21.3, -3], s: 1.8 },
        { pos: [0, -21.6, -7], s: 2.4 },
        { pos: [-3, -21.4, 7], s: 1.7 },
      ].map((rock, idx) => (
        <mesh key={idx} position={rock.pos as [number, number, number]} scale={rock.s}>
          <dodecahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial color="#08222a" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}

      {/* --- SEABED FLOOR WITH CAUSTIC LIGHT SHADER (at Y = -22) --- */}
      <mesh position={[0, -22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60, 48, 48]} />
        <shaderMaterial
          ref={causticMatRef}
          args={[CausticShaderMaterial]}
        />
      </mesh>

      {/* --- FLOATING DRIFTING BUBBLES / PARTICLES --- */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#64e3da"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
