import * as THREE from 'three';

export const CausticShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColorBase: { value: new THREE.Color('#05161d') },
    uColorCaustic: { value: new THREE.Color('#64e3da') },
    uIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorBase;
    uniform vec3 uColorCaustic;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    // Procedural caustic cellular pattern
    float causticPattern(vec2 p, float t) {
      vec2 p1 = p * 4.0;
      float c1 = sin(p1.x * 2.0 + t) * cos(p1.y * 2.0 + t);
      float c2 = sin(p1.x * 3.0 - t * 1.2) * sin(p1.y * 3.0 + t * 0.8);
      float c3 = cos((p1.x + p1.y) * 4.0 + t * 1.5);
      float val = pow(abs(c1 + c2 + c3) / 3.0, 3.5);
      return val * 2.5;
    }

    void main() {
      float c = causticPattern(vWorldPos.xz * 0.15, uTime * 1.2) * uIntensity;
      vec3 color = mix(uColorBase, uColorCaustic, clamp(c, 0.0, 1.0) * 0.45);
      
      // Distance fade
      float dist = length(vWorldPos.xz);
      float fade = 1.0 - smoothstep(10.0, 35.0, dist);

      gl_FragColor = vec4(color * fade, 1.0);
    }
  `,
};
