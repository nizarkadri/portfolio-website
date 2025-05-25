'use client';

import React, { useRef, useEffect } from 'react';
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

  // Simplex noise (Ashima Arts)
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}  
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){ /* implementation omitted for brevity */ return 0.0; }

  void main() {
    vec3 pos = position;
    float noise = snoise(vec3(pos * 0.1 + uTime * 0.1));
    pos += normal * noise * 0.2;
    pos.y += uScroll * 2.0;
    pos.x += sin(uTime * 0.5 + pos.y * 0.1) * 0.2;
    pos *= 1.0 + sin(uTime * 0.5) * 0.1;
    pos += vec3(uMouse, 0.0) * 0.1;
    pos = pos * instanceScale + instancePosition;
    vLineProgress = mod(uTime * 0.1 + lineIndex * 0.1 + uScroll * 2.0, 1.0);
    vPosition = pos;
    vNoise = noise;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
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

  vec3 rgb2hsv(vec3 c){ /* omitted */ return c; }
  vec3 hsv2rgb(vec3 c){ /* omitted */ return c; }

  void main() {
    float alpha = smoothstep(0.0, 0.1, vLineProgress) * smoothstep(1.0, 0.8, vLineProgress);
    alpha *= 0.8 + vNoise * 0.4;
    vec3 hsv = rgb2hsv(uColor);
    hsv.x += vNoise * 0.1 + sin(uTime * 0.5) * 0.05;
    hsv.y = min(hsv.y * uSaturation, 1.0);
    hsv.z *= (1.0 + sin(vPosition.x * 0.1 + uTime) * 0.2) * uBrightness;
    vec3 color = hsv2rgb(hsv);
    color = (color - 0.5) * uContrast + 0.5;
    float fresnel = pow(1.0 - dot(normalize(vPosition), vec3(0.0,0.0,1.0)), 3.0);
    color += fresnel * 0.3;
    color *= (0.9 + sin(uTime * 2.0) * 0.2);
    color += smoothstep(0.4,1.0,vLineProgress) * vec3(0.2,0.3,0.1) * (sin(uTime*2.0)*0.5+0.5);
    gl_FragColor = vec4(color, alpha * (0.6 + fresnel * 0.2));
  }
`;

const OptimizedThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRef | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    // Setup scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Fixed full-screen background
    Object.assign(renderer.domElement.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', zIndex: '-1', pointerEvents: 'none'
    });
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x404040, 0.01));
    const dl = new THREE.DirectionalLight(0xB8E62D, 0.005); dl.position.set(10,10,10); dl.castShadow=true; scene.add(dl);
    scene.add(new THREE.PointLight(0x89D32D, 0.003).copy(new THREE.PointLight()));
    scene.add(new THREE.SpotLight(0xB8E62D, 0.002).copy(new THREE.SpotLight()));

    // Geometry & material
    const geo = new THREE.IcosahedronGeometry(1,4);
    const uniforms = {
      uColor: { value: new THREE.Color(0xB8E62D).multiplyScalar(0.6) },
      uTime: { value: 0 }, uScroll: { value: 0 }, uProgress: { value: 0 }, uMouse: { value: new THREE.Vector2() },
      uBrightness: { value: 0.6 }, uContrast: { value: 1.3 }, uSaturation: { value: 0.8 }
    };
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide });
    const count = 30;
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    // Instances
    const posArr = new Float32Array(count*3), scaleArr = new Float32Array(count);
    const R=12; for(let i=0;i<count;i++){ const phi=Math.acos(1-2*(i/count)), th=Math.PI*(1+Math.sqrt(5))*i;
      posArr[3*i] = R*Math.sin(phi)*Math.cos(th);
      posArr[3*i+1] = R*Math.sin(phi)*Math.sin(th);
      posArr[3*i+2] = R*Math.cos(phi);
      scaleArr[i] = 0.3 + Math.random()*0.7;
    }
    geo.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(posArr,3));
    geo.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scaleArr,1));
    scene.add(mesh);

    // Postprocessing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene,camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.3,0.5,0.6));
    const fxaa = new ShaderPass(FXAAShader);
    fxaa.material.uniforms['resolution'].value.set(1/(window.innerWidth*renderer.getPixelRatio()),1/(window.innerHeight*renderer.getPixelRatio()));
    composer.addPass(fxaa);

    // Scroll & mouse
    let curScroll=0, tgtScroll=0;
    const onScroll=()=>{ tgtScroll=Math.min(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight),1); };
    window.addEventListener('scroll', onScroll,{passive:true});
    const mouse = new THREE.Vector2();
    const onMouse=(e:MouseEvent)=>{ mouse.x=(e.clientX/window.innerWidth)*2-1; mouse.y=-(e.clientY/window.innerHeight)*2+1; };
    window.addEventListener('mousemove', onMouse,{passive:true});

    const clock = new THREE.Clock();
    const animate = ()=>{
      curScroll += (tgtScroll - curScroll)*0.1;
      const t=clock.getElapsedTime();
      uniforms.uTime.value = t; uniforms.uScroll.value = curScroll; uniforms.uMouse.value.lerp(mouse,0.1);
      camera.position.y = -curScroll*5; camera.position.x = Math.sin(t*0.3)*2; camera.lookAt(scene.position);
      composer.render();
      sceneRef.current!.animationFrameId = requestAnimationFrame(animate);
    };
    sceneRef.current = { scene, camera, renderer, composer, geometry:geo, material:mat, instancedMesh:mesh, uniforms, clock, scroll:0, progress:0, mouse, animationFrameId:0 };
    animate();

    // Cleanup
    return ()=>{
      window.cancelAnimationFrame(sceneRef.current!.animationFrameId);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', ()=>{});
      geo.dispose(); mat.dispose(); renderer.dispose();
      mountRef.current!.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default OptimizedThreeScene;
