'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

interface SceneRef {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  instancedMesh: THREE.InstancedMesh;
  uniforms: { [key: string]: THREE.IUniform };
  clock: THREE.Clock;
  scroll: number;
  progress: number;
  mouse: THREE.Vector2;
  animationFrameId: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uScroll;
  uniform float uProgress;
  uniform vec2 uMouse;
  
  attribute float lineLength;
  attribute float lineIndex;
  attribute vec3 instancePosition;
  attribute float instanceScale;
  
  varying float vLineProgress;
  varying vec3 vPosition;
  varying float vNoise;
  
  //	Simplex 3D Noise 
  //	by Ian McEwan, Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  
  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }
  
  void main() {
    vec3 pos = position;
    float noise = snoise(vec3(pos.x * 0.1 + uTime * 0.1, pos.y * 0.1, pos.z * 0.1));
    
    // Scroll-based transformations
    float scrollEffect = uScroll * 2.0;
    float progressEffect = uProgress;
    
    // Apply noise distortion
    pos += normal * noise * 0.2;
    
    // Apply scroll-based movement
    pos.y += scrollEffect * (1.0 + noise * 0.5);
    pos.x += sin(uTime * 0.5 + pos.y * 0.1) * 0.2;
    
    // Scale based on scroll and progress
    float scale = 1.0 + sin(uTime * 0.5) * 0.1;
    pos *= scale;
    
    // Mouse interaction
    vec2 mouseEffect = uMouse * 0.1;
    pos.x += mouseEffect.x;
    pos.y += mouseEffect.y;
    
    // Instance transformations
    pos = pos * instanceScale + instancePosition;
    
    // Calculate line progress
    float progress = mod(uTime * 0.1 + lineIndex * 0.1 + scrollEffect, 1.0);
    vLineProgress = progress;
    
    // Store position for fragment shader
    vPosition = pos;
    vNoise = noise;
    
    // Project position
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uProgress;
  uniform float uBrightness;
  uniform float uContrast;
  uniform float uSaturation;
  
  varying float vLineProgress;
  varying vec3 vPosition;
  varying float vNoise;
  
  // Color conversion utilities
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    // Create smooth line effect with enhanced noise
    float alpha = smoothstep(0.0, 0.1, vLineProgress) * smoothstep(1.0, 0.8, vLineProgress);
    alpha *= 0.8 + vNoise * 0.4;
    
    // Enhanced color variation based on position and noise
    vec3 baseColor = uColor;
    vec3 hsvColor = rgb2hsv(baseColor);
    
    // Adjust hue based on noise and time
    hsvColor.x += vNoise * 0.1 + sin(uTime * 0.5) * 0.05;
    
    // Enhance saturation
    hsvColor.y = min(hsvColor.y * uSaturation, 1.0);
    
    // Dynamic brightness based on position
    float brightnessFactor = 1.0 + sin(vPosition.x * 0.1 + uTime) * 0.2;
    hsvColor.z *= brightnessFactor * uBrightness;
    
    vec3 color = hsv2rgb(hsvColor);
    
    // Apply contrast
    color = (color - 0.5) * uContrast + 0.5;
    
    // Enhance edges with fresnel-like effect
    float fresnel = pow(1.0 - dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)), 3.0);
    color += fresnel * 0.3;
    
    // Add subtle color pulsing
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    color *= 0.9 + pulse * 0.2;
    
    // Add glow effect
    float glow = smoothstep(0.4, 1.0, vLineProgress);
    color += glow * vec3(0.2, 0.3, 0.1) * pulse;
    
    // Final color composition
    gl_FragColor = vec4(color, alpha * (0.6 + fresnel * 0.2));
  }
`;

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRef | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize the scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002); // Very subtle fog
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Enhanced renderer settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8; // Reduced exposure
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Extremely subtle lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.001);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xB8E62D, 0.002);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Create geometry with higher detail and smoother normals
    const geometry = new THREE.IcosahedronGeometry(1, 5); // Increased detail level
    geometry.computeVertexNormals();
    
    // Enhanced uniforms with more subtle colors and effects
    const uniforms = {
      uColor: { value: new THREE.Color(0xB8E62D).multiplyScalar(0.1) }, // Very subtle base color
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uBrightness: { value: 0.3 }, // Reduced brightness
      uContrast: { value: 1.5 }, // Increased contrast
      uSaturation: { value: 0.3 }, // Reduced saturation
      uNoiseScale: { value: 3.0 }, // Added noise scale
      uNoiseSpeed: { value: 0.5 } // Added noise speed
    };

    // Create a more sophisticated material
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        uniform float uTime;
        uniform float uNoiseScale;
        uniform float uNoiseSpeed;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Improved Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                  
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vNormal = normal;
          vPosition = position;
          
          // Calculate noise
          float noise = snoise(vec3(
            position.x * uNoiseScale + uTime * uNoiseSpeed,
            position.y * uNoiseScale + uTime * uNoiseSpeed,
            position.z * uNoiseScale
          )) * 0.1; // Reduced noise influence
          
          // Apply subtle displacement
          vec3 pos = position + normal * noise * 0.05;
          
          // Subtle wave effect
          float wave = sin(uTime * 0.5 + position.y * 2.0) * 0.02;
          pos += normal * wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uBrightness;
        uniform float uContrast;
        uniform float uSaturation;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Calculate fresnel effect
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
          
          // Create subtle color variation
          vec3 color = uColor;
          color += fresnel * 0.1; // Very subtle fresnel influence
          
          // Add gentle pulse
          float pulse = sin(uTime) * 0.05 + 0.95;
          color *= pulse;
          
          // Apply brightness and contrast
          color = (color - 0.5) * uContrast + 0.5;
          color *= uBrightness;
          
          // Subtle vignette effect
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          float vignette = smoothstep(0.5, 0.2, length(uv - 0.5));
          color *= mix(1.0, vignette, 0.3);
          
          gl_FragColor = vec4(color, 0.8); // Slightly transparent
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Create instanced mesh with fewer instances
    const instanceCount = 40; // Reduced from previous value
    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      instanceCount
    );

    // Position instances in a more artistic arrangement
    const dummy = new THREE.Object3D();
    const radius = 8;
    
    for (let i = 0; i < instanceCount; i++) {
      const theta = Math.sqrt(i / instanceCount) * Math.PI * 2;
      const phi = Math.acos(1 - 2 * (i / instanceCount));
      
      dummy.position.x = radius * Math.sin(phi) * Math.cos(theta);
      dummy.position.y = radius * Math.sin(phi) * Math.sin(theta);
      dummy.position.z = radius * Math.cos(phi);
      
      dummy.scale.setScalar(Math.random() * 0.3 + 0.1); // Smaller scale range
      
      dummy.rotation.x = Math.random() * Math.PI;
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.rotation.z = Math.random() * Math.PI;
      
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    // Position camera
    camera.position.z = 15;

    // Setup post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.1, // Very subtle bloom
      0.8, // Wider radius
      0.9  // Higher threshold
    );
    composer.addPass(bloomPass);

    // Animation loop with smoother camera movement
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Update uniforms
      material.uniforms.uTime.value = elapsedTime;
      
      // Subtle camera movement
      camera.position.x = Math.sin(elapsedTime * 0.1) * 1.0;
      camera.position.y = Math.cos(elapsedTime * 0.15) * 0.5;
      camera.lookAt(scene.position);
      
      // Rotate instanced mesh very slowly
      instancedMesh.rotation.y = elapsedTime * 0.05;
      instancedMesh.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;
      
      composer.render();
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeScene;