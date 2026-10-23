import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WaterShaderMaterial } from '../shaders/waterShader';
import { useSearchStore } from '../store/useSearchStore';
import { currentSkyState } from '../config/skyPalette';

export const SurfaceScene: React.FC = () => {
  const quality = useSearchStore((s) => s.quality);

  const waterMatRef = useRef<THREE.ShaderMaterial>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const sphereMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const sphereLightRef = useRef<THREE.PointLight>(null);
  
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  
  const toriiMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const stoneMatRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const lanternMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const lanternLightRef = useRef<THREE.PointLight>(null);
  const firefliesRef = useRef<THREE.Points>(null);

  // Fireflies count
  const fireflyCount = quality === 'low' ? 0 : 18;
  const { fireflyPositions, fireflySeeds } = useMemo(() => {
    const pos = new Float32Array(fireflyCount * 3);
    const seeds = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      // Clustered around the lantern position: x ~ -3.8, y ~ 1.6, z ~ 1.0
      pos[i * 3 + 0] = -3.8 + (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 1] = 0.8 + Math.random() * 2.0;
      pos[i * 3 + 2] = 1.0 + (Math.random() - 0.5) * 2.5;

      seeds[i * 3 + 0] = Math.random() * 10;
      seeds[i * 3 + 1] = Math.random() * 10;
      seeds[i * 3 + 2] = Math.random() * 10;
    }
    return { fireflyPositions: pos, fireflySeeds: seeds };
  }, [fireflyCount]);

  useFrame((state, delta) => {
    const palette = currentSkyState;
    const t = state.clock.elapsedTime;

    // 1. Dynamic Lights following the sun & time of day
    if (dirLightRef.current) {
      dirLightRef.current.position.copy(palette.sunPos);
      dirLightRef.current.color.copy(palette.sunColor);
      dirLightRef.current.intensity = Math.max(0.05, palette.sunIntensity);
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.copy(palette.hemiSkyColor);
      hemiLightRef.current.groundColor.copy(palette.hemiGroundColor);
      hemiLightRef.current.intensity = palette.ambientIntensity;
    }

    // 2. Torii & Stone Materials tint
    if (toriiMatRef.current) {
      toriiMatRef.current.color.copy(palette.toriiColor);
    }
    if (stoneMatRef.current) {
      stoneMatRef.current.color.copy(palette.stoneColor);
    }

    // 3. Glowing Sphere (gentle bob & dynamic emissive)
    if (sphereRef.current) {
      sphereRef.current.position.y = 2.8 + Math.sin(t * 0.7) * 0.06;
    }
    if (sphereMatRef.current) {
      sphereMatRef.current.emissiveIntensity = palette.sphereEmissiveIntensity;
    }
    if (sphereLightRef.current) {
      sphereLightRef.current.intensity = palette.sphereEmissiveIntensity * 1.25;
    }

    // 4. Stone Lantern (gentle 1.5 Hz breathing flicker scaled by palette intensity)
    if (lanternLightRef.current) {
      const flicker = Math.sin(t * 1.5 * Math.PI * 2) * 0.05;
      lanternLightRef.current.intensity = Math.max(0, palette.lanternPointIntensity + flicker);
    }
    if (lanternMatRef.current) {
      lanternMatRef.current.emissiveIntensity = palette.lanternIntensity;
    }

    // 5. Fireflies drifting around lantern at dusk and night
    if (firefliesRef.current && fireflyCount > 0) {
      const posAttr = firefliesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const isNocturnal = palette.lanternIntensity > 1.8;
      const targetOpacity = isNocturnal ? 0.45 : 0.0;
      
      const mat = firefliesRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05);

      if (mat.opacity > 0.01) {
        for (let i = 0; i < fireflyCount; i++) {
          const sX = fireflySeeds[i * 3 + 0];
          const sY = fireflySeeds[i * 3 + 1];
          const sZ = fireflySeeds[i * 3 + 2];
          arr[i * 3 + 0] = -3.8 + Math.sin(t * 0.6 + sX) * 1.2;
          arr[i * 3 + 1] = 1.4 + Math.sin(t * 0.8 + sY) * 0.7;
          arr[i * 3 + 2] = 1.0 + Math.cos(t * 0.5 + sZ) * 1.2;
        }
        posAttr.needsUpdate = true;
      }
    }

    // 6. Water Shader Sky Reflection & Sheen Sync
    if (waterMatRef.current) {
      const mat = waterMatRef.current;
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uZenithColor.value.copy(palette.zenithColor);
      mat.uniforms.uHorizonColor.value.copy(palette.horizonColor);
      mat.uniforms.uColorDeep.value.copy(palette.waterDeepColor);
      mat.uniforms.uSunPosition.value.copy(palette.sunPos);
      mat.uniforms.uSunColor.value.copy(palette.sunColor);
      mat.uniforms.uSunIntensity.value = palette.sunIntensity;
      mat.uniforms.uMoonPosition.value.copy(palette.moonPos);
      mat.uniforms.uMoonColor.value.copy(palette.moonColor);
      mat.uniforms.uMoonIntensity.value = palette.moonIntensity;
      mat.uniforms.uToriiColor.value.copy(palette.toriiColor);
      mat.uniforms.uSphereEmissive.value = palette.sphereEmissiveIntensity;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sun / Moon Directional Key Light */}
      <directionalLight
        ref={dirLightRef}
        position={[8, 12, 10]}
        intensity={1.8}
        color="#ffa459"
        castShadow
      />

      {/* Hemisphere Ambient Fill */}
      <hemisphereLight
        ref={hemiLightRef}
        args={['#ffe1c4', '#0d4653', 0.6]}
      />

      {/* --- TORII GATE --- */}
      <group position={[0, 0, -4]}>
        {/* Foundation Plinths */}
        <mesh position={[-2.4, 0.15, 0]}>
          <cylinderGeometry args={[0.35, 0.42, 0.3, 16]} />
          <meshStandardMaterial ref={stoneMatRef} color="#3a3d42" roughness={0.9} />
        </mesh>
        <mesh position={[2.4, 0.15, 0]}>
          <cylinderGeometry args={[0.35, 0.42, 0.3, 16]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.9} />
        </mesh>

        {/* Vertical Pillars (Hashira) */}
        <mesh position={[-2.4, 2.8, 0]}>
          <cylinderGeometry args={[0.24, 0.28, 5.2, 16]} />
          <meshStandardMaterial ref={toriiMatRef} color="#d33c2a" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[2.4, 2.8, 0]}>
          <cylinderGeometry args={[0.24, 0.28, 5.2, 16]} />
          <meshStandardMaterial color="#d33c2a" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Lower Horizontal Tie Beam (Nuki) */}
        <mesh position={[0, 4.3, 0]}>
          <boxGeometry args={[5.6, 0.26, 0.24]} />
          <meshStandardMaterial color="#d33c2a" roughness={0.4} />
        </mesh>

        {/* Upper Secondary Lintel (Shimaki) */}
        <mesh position={[0, 5.2, 0]}>
          <boxGeometry args={[6.2, 0.28, 0.32]} />
          <meshStandardMaterial color="#d33c2a" roughness={0.4} />
        </mesh>

        {/* Top Curved Lintel (Kasagi) with dark accents */}
        <mesh position={[0, 5.55, 0]}>
          <boxGeometry args={[6.8, 0.38, 0.42]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Central Tablet / Plaque (Gakuzuka) */}
        <mesh position={[0, 4.75, 0]}>
          <boxGeometry args={[0.55, 0.65, 0.12]} />
          <meshStandardMaterial color="#1f1e24" roughness={0.7} />
        </mesh>
      </group>

      {/* --- GLOWING WHITE SPHERE (Centered beyond Torii) --- */}
      <group position={[0, 0, -8]}>
        <mesh ref={sphereRef} position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshStandardMaterial
            ref={sphereMatRef}
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.2}
            roughness={0.15}
          />
        </mesh>
        {/* Soft Point Light from the sphere */}
        <pointLight ref={sphereLightRef} position={[0, 2.8, 0]} color="#ffffff" intensity={1.5} distance={15} />

        {/* Subtle orbit halo ring */}
        <mesh position={[0, 2.8, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[1.3, 1.34, 64]} />
          <meshBasicMaterial color="#ffd8a8" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* --- STONE LANTERN (Toro) --- */}
      <group position={[-3.8, 0, 1]}>
        {/* Base */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.9, 0.4, 0.9]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
        {/* Shaft */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.8, 8]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
        {/* Middle Platform */}
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.75, 0.2, 0.75]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
        {/* Light Chamber */}
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial
            ref={lanternMatRef}
            color="#ffa34d"
            emissive="#ffa34d"
            emissiveIntensity={1.8}
            roughness={0.4}
          />
        </mesh>
        <pointLight
          ref={lanternLightRef}
          position={[0, 1.65, 0]}
          color="#ff8d29"
          intensity={2.0}
          distance={8}
        />
        {/* Roof (Kasa) */}
        <mesh position={[0, 2.05, 0]}>
          <coneGeometry args={[0.7, 0.35, 4]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
        {/* Jewel Top (Hoju) */}
        <mesh position={[0, 2.35, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
      </group>

      {/* --- FIREFLIES NEAR LANTERN (At night/dusk) --- */}
      {fireflyCount > 0 && (
        <points ref={firefliesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[fireflyPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            color="#ffd66b"
            transparent
            opacity={0.0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* --- STONE STEPS LEADING DOWN TO WATER --- */}
      <group position={[0, 0, 2]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[4.2, 0.25, 1.2]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.15, 1.1]}>
          <boxGeometry args={[4.6, 0.25, 1.2]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.0, 2.2]}>
          <boxGeometry args={[5.0, 0.25, 1.2]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.85} />
        </mesh>
      </group>

      {/* --- SCATTER ROCKS ALONG BANK --- */}
      {[
        { pos: [-3.2, 0.2, -1] as [number, number, number], scale: [0.8, 0.5, 0.7] as [number, number, number] },
        { pos: [3.4, 0.25, 0.5] as [number, number, number], scale: [1.1, 0.6, 0.9] as [number, number, number] },
        { pos: [4.2, 0.15, -2.5] as [number, number, number], scale: [0.7, 0.4, 0.6] as [number, number, number] },
        { pos: [-4.5, 0.3, -3.2] as [number, number, number], scale: [1.3, 0.7, 1.0] as [number, number, number] },
      ].map((rock, idx) => (
        <mesh key={idx} position={rock.pos} scale={rock.scale}>
          <dodecahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#2d3035" roughness={0.92} />
        </mesh>
      ))}

      {/* --- REFLECTIVE WATER PLANE (at Y = 0) --- */}
      <mesh position={[0, 0, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[45, 45, 64, 64]} />
        <shaderMaterial
          ref={waterMatRef}
          args={[WaterShaderMaterial]}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
