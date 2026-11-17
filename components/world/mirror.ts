import * as THREE from 'three';

/** The polished floor: a soft, angle-dependent mirror laid over the stone. */
export const MIRROR = {
  name: 'LongGameFloor',
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uStrength: { value: 1 },
    uTexel: { value: new THREE.Vector2(1 / 1024, 1 / 512) },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vWorld;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vec4 w = modelMatrix * vec4(position, 1.0);
      vWorld = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform vec2 uTexel;
    varying vec4 vUv;
    varying vec3 vWorld;
    void main() {
      vec2 uv = vUv.xy / vUv.w;
      vec3 V = normalize(cameraPosition - vWorld);
      float d = distance(cameraPosition, vWorld);
      // honed, not chromed: a small blur that opens with distance
      vec2 r = uTexel * (1.5 + min(d, 30.0) * 0.12);
      vec3 c = texture2D(tDiffuse, uv).rgb * 0.28;
      c += texture2D(tDiffuse, uv + vec2(r.x, 0.0)).rgb * 0.12;
      c += texture2D(tDiffuse, uv - vec2(r.x, 0.0)).rgb * 0.12;
      c += texture2D(tDiffuse, uv + vec2(0.0, r.y * 1.6)).rgb * 0.12;
      c += texture2D(tDiffuse, uv - vec2(0.0, r.y * 1.6)).rgb * 0.12;
      c += texture2D(tDiffuse, uv + r).rgb * 0.06;
      c += texture2D(tDiffuse, uv - r).rgb * 0.06;
      c += texture2D(tDiffuse, uv + vec2(r.x, -r.y)).rgb * 0.06;
      c += texture2D(tDiffuse, uv + vec2(-r.x, r.y)).rgb * 0.06;
      float f = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
      float a = (0.08 + 0.46 * f) * uStrength;
      gl_FragColor = vec4(c, a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
};
