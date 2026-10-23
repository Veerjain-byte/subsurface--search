import * as THREE from 'three';

export const WaterShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uZenithColor: { value: new THREE.Color('#2d3b66') },
    uHorizonColor: { value: new THREE.Color('#f59342') },
    uColorDeep: { value: new THREE.Color('#0d4653') },
    uSunPosition: { value: new THREE.Vector3(-12, 6, -14) },
    uSunColor: { value: new THREE.Color('#ff983d') },
    uSunIntensity: { value: 1.5 },
    uMoonPosition: { value: new THREE.Vector3(10, 8, -6) },
    uMoonColor: { value: new THREE.Color('#b4d3ff') },
    uMoonIntensity: { value: 0.3 },
    uGlitter: { value: 0.12 },
    uToriiColor: { value: new THREE.Color('#d33c2a') },
    uSphereEmissive: { value: 1.2 },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Gentle, calm layered ripples with slowed time (40% speed) and reduced amplitudes
      float t1 = uTime * 0.72;
      float t2 = uTime * 0.56;
      float t3 = uTime * 0.88;

      float wave1 = sin(pos.x * 1.1 + t1) * 0.06;
      float wave2 = cos(pos.y * 1.5 + t2) * 0.04;
      float wave3 = sin((pos.x + pos.y) * 1.2 + t3) * 0.015;
      pos.z += wave1 + wave2 + wave3;

      vPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
      
      // Smooth, gentle displaced normal without harsh micro-faceting
      vec3 displacedNormal = normal;
      displacedNormal.x += cos(pos.x * 1.1 + t1) * 0.05;
      displacedNormal.y += sin(pos.y * 1.5 + t2) * 0.035;
      vNormal = normalize(normalMatrix * displacedNormal);

      gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uZenithColor;
    uniform vec3 uHorizonColor;
    uniform vec3 uColorDeep;
    uniform vec3 uSunPosition;
    uniform vec3 uSunColor;
    uniform float uSunIntensity;
    uniform vec3 uMoonPosition;
    uniform vec3 uMoonColor;
    uniform float uMoonIntensity;
    uniform float uGlitter;
    uniform vec3 uToriiColor;
    uniform float uSphereEmissive;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vPosition);
      
      // Fresnel effect for water surface reflectivity
      float fresnel = clamp(pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0), 0.0, 1.0);

      // Sample real sky gradient along reflected view direction
      vec3 reflDir = reflect(-viewDir, vNormal);
      float reflHeight = max(0.0, reflDir.y);
      vec3 skyReflection = mix(uHorizonColor, uZenithColor, pow(reflHeight, 0.65));

      // Distance fade so the far water remains calm and mirror-like
      float distToCam = length(cameraPosition - vPosition);
      float distFade = 1.0 - smoothstep(14.0, 32.0, distToCam);

      // --- SOFT PLANAR REFLECTIONS OF TORII GATE & GLOWING SPHERE ---
      vec3 objectReflection = vec3(0.0);
      if (reflDir.z < -0.02) {
        // 1. Torii Gate at Z = -4.0
        float tTorii = (-4.0 - vPosition.z) / reflDir.z;
        if (tTorii > 0.0 && tTorii < 28.0) {
          vec3 hitTorii = vPosition + reflDir * tTorii;
          float inLeftPillar = 1.0 - smoothstep(0.20, 0.36, abs(hitTorii.x - (-2.4)));
          float inRightPillar = 1.0 - smoothstep(0.20, 0.36, abs(hitTorii.x - 2.4));
          float inLintel = (1.0 - smoothstep(0.0, 0.4, abs(hitTorii.y - 4.8))) *
                           (1.0 - smoothstep(2.6, 3.4, abs(hitTorii.x)));
          float heightMask = smoothstep(0.0, 0.4, hitTorii.y) * (1.0 - smoothstep(5.4, 5.8, hitTorii.y));

          float toriiMask = clamp((inLeftPillar + inRightPillar + inLintel) * heightMask, 0.0, 1.0);
          objectReflection += uToriiColor * toriiMask * 0.42;
        }

        // 2. Glowing White Sphere at Z = -8.0, Y = 2.8, X = 0.0
        float tSphere = (-8.0 - vPosition.z) / reflDir.z;
        if (tSphere > 0.0 && tSphere < 36.0) {
          vec3 hitSphere = vPosition + reflDir * tSphere;
          float dSphere = length(hitSphere.xy - vec2(0.0, 2.8));
          float sphereRefl = exp(-dSphere * 1.35) * 0.55 * (uSphereEmissive / 1.2);
          objectReflection += vec3(1.0, 0.96, 0.90) * sphereRefl;
        }
      }

      // Sun sheen following real sun position
      vec3 sunDir = normalize(uSunPosition);
      vec3 sunHalfDir = normalize(sunDir + viewDir);
      float sunDot = max(dot(vNormal, sunHalfDir), 0.0);
      float sunElevation = clamp(sunDir.y, 0.0, 1.0);

      float broadSunSheen = pow(sunDot, 24.0) * 0.25 * sunElevation * (uGlitter / 0.12) * distFade;

      // Faint moon path at night
      vec3 moonDir = normalize(uMoonPosition);
      vec3 moonHalfDir = normalize(moonDir + viewDir);
      float moonDot = max(dot(vNormal, moonHalfDir), 0.0);
      float moonElevation = clamp(moonDir.y, 0.0, 1.0);
      float moonSheen = pow(moonDot, 32.0) * 0.18 * moonElevation * uMoonIntensity * distFade;

      // Blend deep water body with sky & object reflections by Fresnel
      vec3 reflectedSkyAndObjects = skyReflection + objectReflection * distFade;
      vec3 waterColor = mix(uColorDeep, reflectedSkyAndObjects, fresnel * 0.88);

      // Add sun sheen & moon path
      vec3 sheenContribution = (uSunColor * broadSunSheen * uSunIntensity) + (uMoonColor * moonSheen);

      vec3 finalColor = clamp(waterColor + sheenContribution, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, 0.88);
    }
  `,
};
