import * as THREE from 'three';

export interface SkyPaletteKeyframe {
  time: number; // 0 to 1
  name: string;
  zenithColor: string;
  horizonColor: string;
  groundHazeColor: string;
  fogColor: string;
  
  // Sun & Moon
  sunPos: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  moonPos: [number, number, number];
  moonColor: string;
  moonIntensity: number;

  // Environment & Lights
  hemiSkyColor: string;
  hemiGroundColor: string;
  ambientIntensity: number;

  // Water & Props
  waterSurfaceColor: string;
  waterDeepColor: string;
  toriiColor: string;
  stoneColor: string;
  lanternIntensity: number;
  lanternPointIntensity: number;
  sphereEmissiveIntensity: number;
  
  // Underwater & Post
  bloomIntensity: number;
  underwaterShaftIntensity: number;
  underwaterAmbientIntensity: number;
  causticIntensity: number;
  
  // UI Design Tokens (WCAG AA compliant)
  ui: {
    bg: string;
    textPrimary: string;
    textMuted: string;
    glassBg: string;
    glassBorder: string;
    pillBg: string;
    pillText: string;
    accent: string;
  };
}

export interface SkyPaletteState {
  timeOfDay: number;
  zenithColor: THREE.Color;
  horizonColor: THREE.Color;
  groundHazeColor: THREE.Color;
  fogColor: THREE.Color;
  
  sunPos: THREE.Vector3;
  sunColor: THREE.Color;
  sunIntensity: number;
  moonPos: THREE.Vector3;
  moonColor: THREE.Color;
  moonIntensity: number;

  hemiSkyColor: THREE.Color;
  hemiGroundColor: THREE.Color;
  ambientIntensity: number;

  waterSurfaceColor: THREE.Color;
  waterDeepColor: THREE.Color;
  toriiColor: THREE.Color;
  stoneColor: THREE.Color;
  lanternIntensity: number;
  lanternPointIntensity: number;
  sphereEmissiveIntensity: number;

  bloomIntensity: number;
  underwaterShaftIntensity: number;
  underwaterAmbientIntensity: number;
  causticIntensity: number;

  ui: {
    bg: string;
    textPrimary: string;
    textMuted: string;
    glassBg: string;
    glassBorder: string;
    pillBg: string;
    pillText: string;
    accent: string;
  };
}

// 5 Keyframes across 24h: Midnight (0.0/1.0), Dawn (0.25), Noon (0.50), Golden Hour (0.70), Dusk (0.78)
export const SKY_KEYFRAMES: SkyPaletteKeyframe[] = [
  {
    time: 0.0,
    name: 'Midnight',
    zenithColor: '#030712',
    horizonColor: '#091322',
    groundHazeColor: '#060d17',
    fogColor: '#08111e',
    sunPos: [0, -18, -12],
    sunColor: '#1e293b',
    sunIntensity: 0.0,
    moonPos: [-8, 16, -10],
    moonColor: '#b4d3ff',
    moonIntensity: 0.85,
    hemiSkyColor: '#0b192c',
    hemiGroundColor: '#030712',
    ambientIntensity: 0.25,
    waterSurfaceColor: '#0a1626',
    waterDeepColor: '#020b12',
    toriiColor: '#6b1c1c',
    stoneColor: '#1c222d',
    lanternIntensity: 2.8,
    lanternPointIntensity: 3.2,
    sphereEmissiveIntensity: 1.6,
    bloomIntensity: 0.35,
    underwaterShaftIntensity: 0.05,
    underwaterAmbientIntensity: 0.45,
    causticIntensity: 0.15,
    ui: {
      bg: '#050a12',
      textPrimary: '#f1f5f9',
      textMuted: '#94a3b8',
      glassBg: 'rgba(8, 18, 32, 0.78)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      pillBg: 'rgba(15, 28, 48, 0.7)',
      pillText: '#f1f5f9',
      accent: '#64e3da',
    },
  },
  {
    time: 0.25,
    name: 'Dawn',
    zenithColor: '#1e2c4f',
    horizonColor: '#d97d74',
    groundHazeColor: '#533644',
    fogColor: '#cf7570',
    sunPos: [14, 4, -12],
    sunColor: '#ffd1a4',
    sunIntensity: 1.5,
    moonPos: [-14, -6, 12],
    moonColor: '#e2e8f0',
    moonIntensity: 0.1,
    hemiSkyColor: '#869ac4',
    hemiGroundColor: '#5a3d46',
    ambientIntensity: 0.65,
    waterSurfaceColor: '#b0656a',
    waterDeepColor: '#0b323c',
    toriiColor: '#ba3228',
    stoneColor: '#36343f',
    lanternIntensity: 1.5,
    lanternPointIntensity: 1.8,
    sphereEmissiveIntensity: 1.2,
    bloomIntensity: 0.25,
    underwaterShaftIntensity: 0.55,
    underwaterAmbientIntensity: 0.75,
    causticIntensity: 0.5,
    ui: {
      bg: '#14121a',
      textPrimary: '#fdf4ec',
      textMuted: '#c5b5aa',
      glassBg: 'rgba(28, 22, 34, 0.75)',
      glassBorder: 'rgba(255, 215, 195, 0.18)',
      pillBg: 'rgba(42, 32, 50, 0.7)',
      pillText: '#fdf4ec',
      accent: '#ff9d73',
    },
  },
  {
    time: 0.50,
    name: 'Noon',
    zenithColor: '#2b78c9',
    horizonColor: '#93c7f4',
    groundHazeColor: '#72a0c7',
    fogColor: '#95c6f0',
    sunPos: [2, 22, -6],
    sunColor: '#fff9ee',
    sunIntensity: 2.6,
    moonPos: [0, -22, 6],
    moonColor: '#ffffff',
    moonIntensity: 0.0,
    hemiSkyColor: '#b6dbfd',
    hemiGroundColor: '#5d8096',
    ambientIntensity: 1.1,
    waterSurfaceColor: '#4ea1d3',
    waterDeepColor: '#0a4a58',
    toriiColor: '#e63e2d',
    stoneColor: '#525964',
    lanternIntensity: 0.2,
    lanternPointIntensity: 0.3,
    sphereEmissiveIntensity: 0.9,
    bloomIntensity: 0.18,
    underwaterShaftIntensity: 1.2,
    underwaterAmbientIntensity: 1.1,
    causticIntensity: 1.0,
    ui: {
      bg: '#0c1a29',
      textPrimary: '#f8fafc',
      textMuted: '#94a3b8',
      glassBg: 'rgba(15, 32, 52, 0.75)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      pillBg: 'rgba(24, 48, 76, 0.72)',
      pillText: '#f8fafc',
      accent: '#38bdf8',
    },
  },
  {
    time: 0.70,
    name: 'Golden Hour',
    zenithColor: '#2d3b66',
    horizonColor: '#f59342',
    groundHazeColor: '#5a3124',
    fogColor: '#ee893e',
    sunPos: [-12, 6, -14],
    sunColor: '#ff983d',
    sunIntensity: 2.2,
    moonPos: [14, -8, 12],
    moonColor: '#ffffff',
    moonIntensity: 0.05,
    hemiSkyColor: '#ffad6b',
    hemiGroundColor: '#3a201c',
    ambientIntensity: 0.85,
    waterSurfaceColor: '#d66835',
    waterDeepColor: '#0b3640',
    toriiColor: '#d63321',
    stoneColor: '#3e3635',
    lanternIntensity: 1.4,
    lanternPointIntensity: 1.6,
    sphereEmissiveIntensity: 1.2,
    bloomIntensity: 0.26,
    underwaterShaftIntensity: 0.8,
    underwaterAmbientIntensity: 0.85,
    causticIntensity: 0.75,
    ui: {
      bg: '#180f12',
      textPrimary: '#fff1e6',
      textMuted: '#cbb3a3',
      glassBg: 'rgba(34, 20, 24, 0.78)',
      glassBorder: 'rgba(255, 175, 120, 0.22)',
      pillBg: 'rgba(54, 30, 36, 0.75)',
      pillText: '#fff1e6',
      accent: '#ffa048',
    },
  },
  {
    time: 0.78,
    name: 'Dusk',
    zenithColor: '#12182b',
    horizonColor: '#9e3b4a',
    groundHazeColor: '#2b1622',
    fogColor: '#782d3e',
    sunPos: [-16, 1.2, -14],
    sunColor: '#ff5e42',
    sunIntensity: 1.4,
    moonPos: [10, 8, -6],
    moonColor: '#cbd5e1',
    moonIntensity: 0.45,
    hemiSkyColor: '#b84d62',
    hemiGroundColor: '#18111d',
    ambientIntensity: 0.5,
    waterSurfaceColor: '#7a293b',
    waterDeepColor: '#07242c',
    toriiColor: '#ab2219',
    stoneColor: '#2a2830',
    lanternIntensity: 2.2,
    lanternPointIntensity: 2.5,
    sphereEmissiveIntensity: 1.4,
    bloomIntensity: 0.28,
    underwaterShaftIntensity: 0.35,
    underwaterAmbientIntensity: 0.6,
    causticIntensity: 0.35,
    ui: {
      bg: '#110b14',
      textPrimary: '#fbeff2',
      textMuted: '#b9a5af',
      glassBg: 'rgba(26, 16, 28, 0.8)',
      glassBorder: 'rgba(255, 140, 160, 0.18)',
      pillBg: 'rgba(44, 26, 48, 0.72)',
      pillText: '#fbeff2',
      accent: '#ff6b8b',
    },
  },
  {
    time: 1.0,
    name: 'Midnight',
    zenithColor: '#030712',
    horizonColor: '#091322',
    groundHazeColor: '#060d17',
    fogColor: '#08111e',
    sunPos: [0, -18, -12],
    sunColor: '#1e293b',
    sunIntensity: 0.0,
    moonPos: [-8, 16, -10],
    moonColor: '#b4d3ff',
    moonIntensity: 0.85,
    hemiSkyColor: '#0b192c',
    hemiGroundColor: '#030712',
    ambientIntensity: 0.25,
    waterSurfaceColor: '#0a1626',
    waterDeepColor: '#020b12',
    toriiColor: '#6b1c1c',
    stoneColor: '#1c222d',
    lanternIntensity: 2.8,
    lanternPointIntensity: 3.2,
    sphereEmissiveIntensity: 1.6,
    bloomIntensity: 0.35,
    underwaterShaftIntensity: 0.05,
    underwaterAmbientIntensity: 0.45,
    causticIntensity: 0.15,
    ui: {
      bg: '#050a12',
      textPrimary: '#f1f5f9',
      textMuted: '#94a3b8',
      glassBg: 'rgba(8, 18, 32, 0.78)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      pillBg: 'rgba(15, 28, 48, 0.7)',
      pillText: '#f1f5f9',
      accent: '#64e3da',
    },
  },
];

// Smooth cubic ease for natural temporal easing
function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Global cached state objects to guarantee ZERO garbage collection per frame
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
const _cachedState: SkyPaletteState = {
  timeOfDay: 0.5,
  zenithColor: new THREE.Color(),
  horizonColor: new THREE.Color(),
  groundHazeColor: new THREE.Color(),
  fogColor: new THREE.Color(),
  sunPos: new THREE.Vector3(),
  sunColor: new THREE.Color(),
  sunIntensity: 1,
  moonPos: new THREE.Vector3(),
  moonColor: new THREE.Color(),
  moonIntensity: 0,
  hemiSkyColor: new THREE.Color(),
  hemiGroundColor: new THREE.Color(),
  ambientIntensity: 1,
  waterSurfaceColor: new THREE.Color(),
  waterDeepColor: new THREE.Color(),
  toriiColor: new THREE.Color(),
  stoneColor: new THREE.Color(),
  lanternIntensity: 1,
  lanternPointIntensity: 1,
  sphereEmissiveIntensity: 1,
  bloomIntensity: 0.25,
  underwaterShaftIntensity: 1,
  underwaterAmbientIntensity: 1,
  causticIntensity: 1,
  ui: {
    bg: '#070b10',
    textPrimary: '#f4ede4',
    textMuted: '#94a3b8',
    glassBg: 'rgba(12, 23, 30, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    pillBg: 'rgba(15, 28, 36, 0.65)',
    pillText: '#f4ede4',
    accent: '#64e3da',
  },
};

export function getSkyPaletteState(t: number): SkyPaletteState {
  // Normalize t into [0, 1]
  const time = ((t % 1) + 1) % 1;
  _cachedState.timeOfDay = time;

  // Find surrounding keyframe segments
  let kA = SKY_KEYFRAMES[0];
  let kB = SKY_KEYFRAMES[1];

  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    if (time >= SKY_KEYFRAMES[i].time && time <= SKY_KEYFRAMES[i + 1].time) {
      kA = SKY_KEYFRAMES[i];
      kB = SKY_KEYFRAMES[i + 1];
      break;
    }
  }

  const factor = smoothStep(kA.time, kB.time, time);

  // Helper color lerp in linear light space
  const lerpColor = (target: THREE.Color, hexA: string, hexB: string) => {
    _c1.set(hexA);
    _c2.set(hexB);
    target.lerpColors(_c1, _c2, factor);
  };

  lerpColor(_cachedState.zenithColor, kA.zenithColor, kB.zenithColor);
  lerpColor(_cachedState.horizonColor, kA.horizonColor, kB.horizonColor);
  lerpColor(_cachedState.groundHazeColor, kA.groundHazeColor, kB.groundHazeColor);
  lerpColor(_cachedState.fogColor, kA.fogColor, kB.fogColor);

  lerpColor(_cachedState.sunColor, kA.sunColor, kB.sunColor);
  _cachedState.sunIntensity = THREE.MathUtils.lerp(kA.sunIntensity, kB.sunIntensity, factor);
  _cachedState.sunPos.set(
    THREE.MathUtils.lerp(kA.sunPos[0], kB.sunPos[0], factor),
    THREE.MathUtils.lerp(kA.sunPos[1], kB.sunPos[1], factor),
    THREE.MathUtils.lerp(kA.sunPos[2], kB.sunPos[2], factor)
  );

  lerpColor(_cachedState.moonColor, kA.moonColor, kB.moonColor);
  _cachedState.moonIntensity = THREE.MathUtils.lerp(kA.moonIntensity, kB.moonIntensity, factor);
  _cachedState.moonPos.set(
    THREE.MathUtils.lerp(kA.moonPos[0], kB.moonPos[0], factor),
    THREE.MathUtils.lerp(kA.moonPos[1], kB.moonPos[1], factor),
    THREE.MathUtils.lerp(kA.moonPos[2], kB.moonPos[2], factor)
  );

  lerpColor(_cachedState.hemiSkyColor, kA.hemiSkyColor, kB.hemiSkyColor);
  lerpColor(_cachedState.hemiGroundColor, kA.hemiGroundColor, kB.hemiGroundColor);
  _cachedState.ambientIntensity = THREE.MathUtils.lerp(kA.ambientIntensity, kB.ambientIntensity, factor);

  lerpColor(_cachedState.waterSurfaceColor, kA.waterSurfaceColor, kB.waterSurfaceColor);
  lerpColor(_cachedState.waterDeepColor, kA.waterDeepColor, kB.waterDeepColor);
  lerpColor(_cachedState.toriiColor, kA.toriiColor, kB.toriiColor);
  lerpColor(_cachedState.stoneColor, kA.stoneColor, kB.stoneColor);

  _cachedState.lanternIntensity = THREE.MathUtils.lerp(kA.lanternIntensity, kB.lanternIntensity, factor);
  _cachedState.lanternPointIntensity = THREE.MathUtils.lerp(kA.lanternPointIntensity, kB.lanternPointIntensity, factor);
  _cachedState.sphereEmissiveIntensity = THREE.MathUtils.lerp(kA.sphereEmissiveIntensity, kB.sphereEmissiveIntensity, factor);

  _cachedState.bloomIntensity = THREE.MathUtils.lerp(kA.bloomIntensity, kB.bloomIntensity, factor);
  _cachedState.underwaterShaftIntensity = THREE.MathUtils.lerp(kA.underwaterShaftIntensity, kB.underwaterShaftIntensity, factor);
  _cachedState.underwaterAmbientIntensity = THREE.MathUtils.lerp(kA.underwaterAmbientIntensity, kB.underwaterAmbientIntensity, factor);
  _cachedState.causticIntensity = THREE.MathUtils.lerp(kA.causticIntensity, kB.causticIntensity, factor);

  // Discrete/blended UI tokens
  _cachedState.ui = factor < 0.5 ? kA.ui : kB.ui;

  return _cachedState;
}

export const currentSkyState = _cachedState;
