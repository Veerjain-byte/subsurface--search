import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { SkyDome } from './SkyDome';
import { SurfaceScene } from './SurfaceScene';
import { UnderwaterScene } from './UnderwaterScene';
import { FloatingResultCards3D } from './FloatingResultCards3D';
import { HashTableStones3D } from './HashTableStones3D';
import { HeapVisualizer3D } from './HeapVisualizer3D';
import { useSearchStore } from '../store/useSearchStore';
import { getSkyPaletteState } from '../config/skyPalette';

// Detect software WebGL to adaptively scale effects
export const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return true;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

const _underwaterFogColor = new THREE.Color('#05161d');
const _blendedFogColor = new THREE.Color();
let _lastUiSyncTime = 0;

const CameraAndEnvironmentController: React.FC = () => {
  const { camera, scene } = useThree();
  const scrollProgress = useSearchStore((s) => s.scrollProgress);
  const isDiving = useSearchStore((s) => s.isDiving);

  useFrame((state, delta) => {
    // 1. Smoothly animate continuous timeOfDay with 2.5s damping
    const store = useSearchStore.getState();
    const currentTod = store.timeOfDay;
    const targetTod = store.targetTimeOfDay;
    
    // Shortest angular distance interpolation for circular 24h cycle
    let diff = targetTod - currentTod;
    if (diff > 0.5) diff -= 1.0;
    else if (diff < -0.5) diff += 1.0;

    let newTod = currentTod;
    if (Math.abs(diff) > 0.0005) {
      newTod = (currentTod + diff * Math.min(1.0, delta * 1.6) + 1.0) % 1.0;
      store.setTimeOfDay(newTod);
    } else if (currentTod !== targetTod) {
      newTod = targetTod;
      store.setTimeOfDay(newTod);
    }

    // 2. Compute full sky palette once per frame
    const palette = getSkyPaletteState(newTod);

    // 3. Update Camera position across scroll timeline
    let targetY = 2.8;
    let targetZ = 9.5;
    let lookAtY = 2.0;
    let lookAtZ = -4.0;

    const p = Math.min(1, Math.max(0, scrollProgress));

    if (p <= 0.20) {
      const localP = p / 0.20;
      targetY = 2.8 - localP * 0.8;
      targetZ = 9.5 - localP * 1.0;
      lookAtY = 2.0;
      lookAtZ = -4.0;
    } else if (p <= 0.40) {
      const localP = (p - 0.20) / 0.20;
      targetY = 2.0 - localP * 11.0;
      targetZ = 8.5 - localP * 1.5;
      lookAtY = 2.0 - localP * 11.0;
      lookAtZ = -3.0;
    } else if (p <= 0.70) {
      const localP = (p - 0.40) / 0.30;
      targetY = -9.0 - localP * 3.5;
      targetZ = 7.0 + localP * 0.8;
      lookAtY = -9.0 - localP * 3.5;
      lookAtZ = 0.0;
    } else {
      const localP = (p - 0.70) / 0.30;
      targetY = -12.5 - localP * 5.0;
      targetZ = 7.8 + localP * 0.8;
      lookAtY = -18.0 - localP * 3.8;
      lookAtZ = -1.0;
    }

    if (isDiving) {
      targetY -= 2.0;
    }

    const lerpSpeed = isDiving ? 4.5 : 3.0;
    camera.position.y += (targetY - camera.position.y) * delta * lerpSpeed;
    camera.position.z += (targetZ - camera.position.z) * delta * lerpSpeed;
    camera.position.x += (0 - camera.position.x) * delta * lerpSpeed;

    camera.lookAt(0, lookAtY, lookAtZ);

    // 4. Smooth Fog Transition: blend over 1.5 unit range around waterline (Y: -0.75 to +0.75)
    if (scene.fog) {
      const fogBlend = THREE.MathUtils.smoothstep(camera.position.y, -0.75, 0.75);
      _blendedFogColor.copy(_underwaterFogColor).lerp(palette.fogColor, fogBlend);
      (scene.fog as THREE.Fog).color.copy(_blendedFogColor);
      (scene.fog as THREE.Fog).near = THREE.MathUtils.lerp(3.5, 6.0, fogBlend);
      (scene.fog as THREE.Fog).far = THREE.MathUtils.lerp(28.0, 42.0, fogBlend);
    }

    // 5. Expose UI design tokens to :root CSS variables (throttled to ~10 times per sec)
    const now = state.clock.elapsedTime;
    if (now - _lastUiSyncTime > 0.1) {
      _lastUiSyncTime = now;
      const root = document.documentElement;
      const ui = palette.ui;
      root.style.setProperty('--color-theme-bg', ui.bg);
      root.style.setProperty('--color-theme-text', ui.textPrimary);
      root.style.setProperty('--color-theme-text-muted', ui.textMuted);
      root.style.setProperty('--color-theme-glass-bg', ui.glassBg);
      root.style.setProperty('--color-theme-glass-border', ui.glassBorder);
      root.style.setProperty('--color-theme-pill-bg', ui.pillBg);
      root.style.setProperty('--color-theme-pill-text', ui.pillText);
      root.style.setProperty('--color-theme-accent', ui.accent);
    }
  });

  return null;
};

export const World3D: React.FC = () => {
  const quality = useSearchStore((s) => s.quality);
  const scrollProgress = useSearchStore((s) => s.scrollProgress);
  const isDiving = useSearchStore((s) => s.isDiving);

  // Chromatic aberration offset strictly during the dive
  const aberrationOffset = useMemo(() => {
    if (isDiving) return new THREE.Vector2(0.005, 0.005);
    if (scrollProgress >= 0.20 && scrollProgress <= 0.40) {
      const dist = Math.abs(scrollProgress - 0.30) / 0.10;
      const intensity = (1 - dist) * 0.0045;
      return new THREE.Vector2(intensity, intensity);
    }
    return new THREE.Vector2(0.0, 0.0);
  }, [scrollProgress, isDiving]);

  const enablePostProcessing = !isSoftwareGl && quality !== 'low';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 2.8, 9.5], fov: 48, near: 0.1, far: 120 }}
        dpr={isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5)}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog('#08111e', 6, 42);
        }}
      >
        <CameraAndEnvironmentController />

        {/* Dynamic SkyDome rendered first */}
        <SkyDome />

        {/* 3D Surface Scene */}
        <SurfaceScene />

        {/* 3D Underwater Scene */}
        <UnderwaterScene />

        {/* Floating 3D Result Cards in the underwater zone */}
        <FloatingResultCards3D />

        {/* Seabed Hash Table Stones and Heap Visualizers */}
        <HashTableStones3D />
        <HeapVisualizer3D />

        {/* Postprocessing (Chromatic Aberration & Soft Bloom) */}
        {enablePostProcessing && (
          <EffectComposer>
            <ChromaticAberration
              offset={aberrationOffset}
              radialModulation={false}
              modulationOffset={0}
            />
            <Bloom
              luminanceThreshold={0.95}
              luminanceSmoothing={0.6}
              intensity={0.25}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};
