import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSearchStore } from '../store/useSearchStore';
import { getSkyPaletteState } from '../config/skyPalette';

export const SkyDomeShader = {
  uniforms: {
    uTime: { value: 0 },
    uZenithColor: { value: new THREE.Color() },
    uHorizonColor: { value: new THREE.Color() },
    uSunPosition: { value: new THREE.Vector3() },
    uSunColor: { value: new THREE.Color() },
    uSunIntensity: { value: 1 },
    uMoonPosition: { value: new THREE.Vector3() },
    uMoonColor: { value: new THREE.Color() },
    uMoonIntensity: { value: 0 },
    uStarOpacity: { value: 0 },
    uCloudOpacity: { value: 0.3 },
  },
  vertexShader: `
    varying vec3 vWorldDirection;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      // Normal points inward on back side
      vWorldDirection = normalize(position);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uZenithColor;
    uniform vec3 uHorizonColor;
    uniform vec3 uSunPosition;
    uniform vec3 uSunColor;
    uniform float uSunIntensity;
    uniform vec3 uMoonPosition;
    uniform vec3 uMoonColor;
    uniform float uMoonIntensity;
    uniform float uStarOpacity;
    uniform float uCloudOpacity;

    varying vec3 vWorldDirection;
    varying vec2 vUv;

    // Hash function for pseudo-random stars
    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    // 2D noise for soft procedural drifting clouds
    float noise2D(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      v += 0.65 * noise2D(p);
      p *= 2.02;
      v += 0.35 * noise2D(p);
      return v;
    }

    void main() {
      vec3 dir = normalize(vWorldDirection);
      
      // Vertical gradient from horizon to zenith
      float h = max(0.0, dir.y);
      float gradientFactor = pow(h, 0.65);
      vec3 skyColor = mix(uHorizonColor, uZenithColor, gradientFactor);

      // Sun disc & wide atmospheric corona glow
      vec3 sunDir = normalize(uSunPosition);
      float sunDot = max(0.0, dot(dir, sunDir));
      if (sunDir.y > -0.15) {
        float sunDisc = smoothstep(0.9985, 0.9995, sunDot) * uSunIntensity;
        float sunCorona = pow(sunDot, 16.0) * 0.45 * uSunIntensity;
        float sunHaze = pow(sunDot, 3.5) * 0.15 * uSunIntensity;
        skyColor += uSunColor * (sunDisc * 1.5 + sunCorona + sunHaze);
      }

      // Moon disc & soft nocturnal glow
      vec3 moonDir = normalize(uMoonPosition);
      float moonDot = max(0.0, dot(dir, moonDir));
      if (moonDir.y > -0.15 && uMoonIntensity > 0.01) {
        float moonDisc = smoothstep(0.9980, 0.9992, moonDot) * uMoonIntensity;
        float moonGlow = pow(moonDot, 24.0) * 0.35 * uMoonIntensity;
        skyColor += uMoonColor * (moonDisc + moonGlow);
      }

      // Stars (only visible when night fades in and above horizon)
      if (uStarOpacity > 0.01 && dir.y > 0.04) {
        vec2 starCoord = dir.xz / (dir.y + 0.45) * 120.0;
        float n = hash21(floor(starCoord));
        if (n > 0.978) {
          // Slow twinkle
          float twinkle = sin(uTime * 1.2 + n * 60.0) * 0.3 + 0.7;
          float starBrightness = smoothstep(0.978, 1.0, n) * twinkle * uStarOpacity * smoothstep(0.04, 0.25, dir.y);
          skyColor += vec3(0.85, 0.92, 1.0) * starBrightness * 1.2;
        }
      }

      // Soft procedural clouds (low contrast, drifting slowly)
      if (dir.y > 0.02 && uCloudOpacity > 0.01) {
        vec2 cloudUV = dir.xz / (dir.y + 0.3) * 1.2 + vec2(uTime * 0.008, uTime * 0.004);
        float cloudVal = fbm(cloudUV);
        float cloudMask = smoothstep(0.42, 0.75, cloudVal) * smoothstep(0.02, 0.35, dir.y) * uCloudOpacity;
        vec3 cloudTint = mix(uHorizonColor, vec3(1.0, 0.95, 0.9), 0.5) * (uSunIntensity * 0.4 + 0.4);
        skyColor = mix(skyColor, cloudTint, cloudMask * 0.38);
      }

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `,
};

export const SkyDome: React.FC = () => {
  const shaderMatRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useSearchStore((s) => s.quality);

  const starCountFactor = quality === 'low' ? 0.3 : quality === 'medium' ? 0.7 : 1.0;
  const cloudActive = quality !== 'low';

  useFrame((state, delta) => {
    if (!shaderMatRef.current) return;
    const timeOfDay = useSearchStore.getState().timeOfDay;
    const palette = getSkyPaletteState(timeOfDay);

    const mat = shaderMatRef.current;
    mat.uniforms.uTime.value += delta;
    mat.uniforms.uZenithColor.value.copy(palette.zenithColor);
    mat.uniforms.uHorizonColor.value.copy(palette.horizonColor);

    mat.uniforms.uSunPosition.value.copy(palette.sunPos);
    mat.uniforms.uSunColor.value.copy(palette.sunColor);
    mat.uniforms.uSunIntensity.value = palette.sunIntensity;

    mat.uniforms.uMoonPosition.value.copy(palette.moonPos);
    mat.uniforms.uMoonColor.value.copy(palette.moonColor);
    mat.uniforms.uMoonIntensity.value = palette.moonIntensity;

    // Stars appear during night / dusk (when sun elevation is low or negative)
    const isNightTime = timeOfDay < 0.22 || timeOfDay > 0.82;
    const targetStarOpacity = isNightTime ? 1.0 * starCountFactor : 0.0;
    mat.uniforms.uStarOpacity.value = THREE.MathUtils.lerp(
      mat.uniforms.uStarOpacity.value,
      targetStarOpacity,
      0.05
    );

    mat.uniforms.uCloudOpacity.value = cloudActive ? 0.35 : 0.0;
  });

  return (
    <mesh renderOrder={-100}>
      <sphereGeometry args={[75, 32, 24]} />
      <shaderMaterial
        ref={shaderMatRef}
        args={[SkyDomeShader]}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
};
