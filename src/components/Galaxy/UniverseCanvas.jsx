import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { loveConfig } from '../../config/loveConfig';
import audioManager from '../../utils/audioManager';

// 1. Background Layer: Watercolor Nebula clouds
const NebulaBackground = () => {
  const meshRef = useRef();
  const materialRef = useRef();

  const nebulaShader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

        vec2 uv1 = p * 1.2 + vec2(uTime * 0.008, uTime * 0.005);
        vec2 uv2 = p * 2.0 - vec2(uTime * 0.01, -uTime * 0.007);

        float n1 = fbm(uv1 + fbm(uv2));
        float n2 = fbm(uv2 + n1);

        vec3 creamBase = vec3(0.99, 0.985, 0.975); // Cream background matching #fffbf9
        vec3 pastelPink = vec3(0.98, 0.88, 0.92);  // Soft pink wash
        vec3 pastelGold = vec3(0.99, 0.95, 0.86);  // Soft gold clouds
        vec3 roseBlush = vec3(0.97, 0.77, 0.82);   // Romantic rose highlights

        vec3 color = mix(creamBase, pastelPink, n1 * 0.5);
        color = mix(color, roseBlush, n2 * 0.3);
        
        float goldMask = smoothstep(0.4, 0.85, fbm(p * 2.2 - vec2(uTime * 0.005)));
        color = mix(color, pastelGold, goldMask * 0.2);

        float borderDist = length(uv - 0.5);
        color = mix(color, creamBase, smoothstep(0.4, 0.95, borderDist) * 0.35);

        gl_FragColor = vec4(color, 0.45);
      }
    `
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -4.5]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={nebulaShader.vertexShader}
        fragmentShader={nebulaShader.fragmentShader}
        uniforms={nebulaShader.uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

// 2. Midground Layer: Interactive Starfield
const Starfield = ({ count = 2000, mouseCoords }) => {
  const pointsRef = useRef();

  const [positions, scales, baseAlpha] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const alpha = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 18 + Math.random() * 70;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(180);

      pos[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(theta);

      scl[i] = 0.06 + Math.random() * 0.22;
      alpha[i] = 0.3 + Math.random() * 0.7;
    }
    return [pos, scl, alpha];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    pointsRef.current.rotation.y = time * 0.003;
    pointsRef.current.rotation.x = time * 0.001;

    gsap.to(pointsRef.current.position, {
      x: mouseCoords.current.x * 1.8,
      y: mouseCoords.current.y * 1.8,
      duration: 1.8,
      ease: 'power2.out'
    });
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fbcfe8"
        size={0.24}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.NormalBlending}
      />
    </Points>
  );
};

// 3. Foreground Layer: Floating blurred bokeh
const ForegroundBokeh = ({ count = 35 }) => {
  const pointsRef = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = THREE.MathUtils.randFloatSpread(15);
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(10);
      pos[i * 3 + 2] = 2 + Math.random() * 6;

      spds[i * 3] = (Math.random() - 0.5) * 0.003;
      spds[i * 3 + 1] = -0.006 - Math.random() * 0.008;
      spds[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, spds];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttribute = pointsRef.current.geometry.attributes.position;
    const array = posAttribute.array;

    for (let i = 0; i < count; i++) {
      array[i * 3] += speeds[i * 3];
      array[i * 3 + 1] += speeds[i * 3 + 1];
      array[i * 3 + 2] += speeds[i * 3 + 2];

      if (array[i * 3 + 1] < -6) {
        array[i * 3 + 1] = 6;
        array[i * 3] = THREE.MathUtils.randFloatSpread(15);
      }
    }
    posAttribute.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fda4af"
        size={0.62}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
        blending={THREE.NormalBlending}
      />
    </Points>
  );
};

// Beating Heart morph particles for Passcode
const MorphingHeartParticles = ({ sceneState }) => {
  const pointsRef = useRef();
  const particleCount = 1800;

  const circleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const [squarePositions, heartPositions, randomVelocities] = useMemo(() => {
    const sqPos = [];
    const htPos = [];
    const vels = [];

    for (let i = 0; i < particleCount; i++) {
      const width = 12;
      const height = 8;
      const depth = 2;
      sqPos.push(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        (Math.random() - 0.5) * depth
      );

      const t = Math.random() * Math.PI * 2;
      const scale = 0.16;
      const x = 16 * Math.pow(Math.sin(t), 3) * scale;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
      
      const phi = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.8;
      const z = r * Math.sin(phi) * 2.2;

      htPos.push(x, y + 0.4, z);

      vels.push(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );
    }

    return [
      new Float32Array(sqPos),
      new Float32Array(htPos),
      new Float32Array(vels)
    ];
  }, []);

  const geometryRef = useRef();

  useEffect(() => {
    if (!geometryRef.current) return;
    geometryRef.current.setAttribute(
      'position',
      new THREE.BufferAttribute(squarePositions, 3)
    );
  }, [squarePositions]);

  useEffect(() => {
    if (!geometryRef.current) return;
    const posAttribute = geometryRef.current.attributes.position;
    
    if (sceneState === 'dissolving') {
      const tempPositions = [...squarePositions];
      gsap.to(tempPositions, {
        endArray: Array.from(squarePositions).map((val, idx) => val + randomVelocities[idx]),
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          for (let i = 0; i < posAttribute.count; i++) {
            posAttribute.setXYZ(i, tempPositions[i * 3], tempPositions[i * 3 + 1], tempPositions[i * 3 + 2]);
          }
          posAttribute.needsUpdate = true;
        }
      });
    } else if (sceneState === 'heart') {
      const tempPositions = Array.from(geometryRef.current.attributes.position.array);
      gsap.to(tempPositions, {
        endArray: Array.from(heartPositions),
        duration: 2.2,
        ease: 'elastic.out(1, 0.75)',
        onUpdate: () => {
          for (let i = 0; i < posAttribute.count; i++) {
            posAttribute.setXYZ(i, tempPositions[i * 3], tempPositions[i * 3 + 1], tempPositions[i * 3 + 2]);
          }
          posAttribute.needsUpdate = true;
        }
      });
    } else if (sceneState === 'warp') {
      const tempPositions = Array.from(geometryRef.current.attributes.position.array);
      gsap.to(tempPositions, {
        endArray: tempPositions.map((val, idx) => {
          if (idx % 3 === 2) return val + 50.0;
          return val * 1.5;
        }),
        duration: 1.5,
        ease: 'power3.in',
        onUpdate: () => {
          for (let i = 0; i < posAttribute.count; i++) {
            posAttribute.setXYZ(i, tempPositions[i * 3], tempPositions[i * 3 + 1], tempPositions[i * 3 + 2]);
          }
          posAttribute.needsUpdate = true;
        }
      });
    }
  }, [sceneState, squarePositions, heartPositions, randomVelocities]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    if (sceneState === 'heart') {
      const pulse = 1.0 + Math.sin(time * 6.0) * 0.05;
      pointsRef.current.scale.set(pulse, pulse, pulse);
      pointsRef.current.rotation.y = time * 0.25;
    } else if (sceneState === 'intro') {
      pointsRef.current.rotation.y = time * 0.04;
      pointsRef.current.rotation.x = time * 0.015;
    }
  });

  const shouldRender = sceneState === 'dissolving' || sceneState === 'heart' || sceneState === 'warp';

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        color="#db2777"
        size={0.18}
        sizeAttenuation={true}
        transparent
        opacity={shouldRender ? 0.95 : 0}
        blending={THREE.NormalBlending}
        map={circleTexture || undefined}
        depthWrite={false}
      />
    </points>
  );
};

// 3. Three-Layer Floating Ceremonial Lantern System with Custom Shader
const FloatingLanterns = ({ active, ceremonyStep, sceneState }) => {
  const lanternsRef = useRef([]);

  // Create a stable pool of 240 lanterns once
  const pool = useMemo(() => {
    const arr = [];
    const total = 240;
    for (let i = 0; i < total; i++) {
      // Determine layer: 
      // 0-149 (Layer 0: Background - dim, tiny, numerous)
      // 150-214 (Layer 1: Midground - visible, moderate, soft glow)
      // 215-239 (Layer 2: Foreground - large, blurred, additive blend)
      let layer = 0;
      if (i >= 150 && i < 215) layer = 1;
      else if (i >= 215) layer = 2;

      let z, scale, targetOpacity, speed;
      if (layer === 0) {
        z = -25 - Math.random() * 20;
        scale = 0.05 + Math.random() * 0.04;
        targetOpacity = 0.2 + Math.random() * 0.25;
        speed = 0.008 + Math.random() * 0.012;
      } else if (layer === 1) {
        z = -10 - Math.random() * 14;
        scale = 0.11 + Math.random() * 0.07;
        targetOpacity = 0.65 + Math.random() * 0.2;
        speed = 0.015 + Math.random() * 0.018;
      } else {
        z = -3 - Math.random() * 6;
        scale = 0.28 + Math.random() * 0.14;
        targetOpacity = 0.22 + Math.random() * 0.23;
        speed = 0.025 + Math.random() * 0.02;
      }

      arr.push({
        x: THREE.MathUtils.randFloatSpread(22),
        y: -12 - Math.random() * 15, // start below horizon
        z,
        layer,
        scale,
        targetOpacity,
        currentOpacity: 0.0, // starts fully transparent
        speed,
        wobbleSpeed: 0.3 + Math.random() * 0.8,
        wobbleScale: 0.1 + Math.random() * 0.15,
        seed: Math.random() * 100,
        active: false // managed dynamically
      });
    }
    return arr;
  }, []);

  const [activeTarget, setActiveTarget] = useState(15);

  // Manage active counts based on ceremonyStep and phase timeouts
  useEffect(() => {
    if (!active) {
      // Deactivate all
      pool.forEach(l => l.active = false);
      return;
    }

    if (['invite', 'countdown', 'entry'].includes(ceremonyStep) || !ceremonyStep) {
      // Base phase: 15 active
      setActiveTarget(15);
      pool.forEach((l, idx) => {
        l.active = idx < 15;
      });
    } else if (ceremonyStep === 'folding' || ceremonyStep === 'envelope') {
      // Start folding: 20 active
      setActiveTarget(20);
      pool.forEach((l, idx) => {
        l.active = idx < 20;
      });
    } else if (ceremonyStep === 'transforming') {
      // Phase 1: 5 lanterns immediately
      setActiveTarget(5);
      pool.forEach((l, idx) => {
        if (idx < 5) l.active = true;
        else l.active = false;
      });

      // Phase 2: 15 lanterns after 1.0s
      const t1 = setTimeout(() => {
        setActiveTarget(15);
        pool.forEach((l, idx) => {
          if (idx < 15) l.active = true;
        });
      }, 1000);

      // Phase 3: 30 lanterns after 2.0s
      const t2 = setTimeout(() => {
        setActiveTarget(30);
        pool.forEach((l, idx) => {
          if (idx < 30) l.active = true;
        });
      }, 2000);

      // Phase 4: 60 lanterns after 3.0s (50+ lanterns)
      const t3 = setTimeout(() => {
        setActiveTarget(60);
        pool.forEach((l, idx) => {
          if (idx < 60) l.active = true;
        });
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (ceremonyStep === 'flying') {
      // Phase 5: Gradually release more lanterns during ascension to represent the full festival
      setActiveTarget(80);
      pool.forEach((l, idx) => {
        if (idx < 80) l.active = true;
      });

      const t1 = setTimeout(() => {
        setActiveTarget(130);
        pool.forEach((l, idx) => {
          if (idx < 130) l.active = true;
        });
      }, 1000);

      const t2 = setTimeout(() => {
        setActiveTarget(180);
        pool.forEach((l, idx) => {
          if (idx < 180) l.active = true;
        });
      }, 2000);

      const t3 = setTimeout(() => {
        setActiveTarget(240);
        pool.forEach((l, idx) => {
          l.active = true;
        });
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (['accepted', 'candles', 'blow-prompt', 'extinguished', 'single-gold', 'second-gold', 'finale', 'ending-fade'].includes(ceremonyStep) || ['single-gold', 'second-gold', 'finale'].includes(sceneState)) {
      // Maintain maximum lanterns
      setActiveTarget(240);
      pool.forEach(l => l.active = true);
    }
  }, [ceremonyStep, sceneState, active, pool]);

  useFrame((state, delta) => {
    if (!active) return;
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    pool.forEach((l, idx) => {
      const mesh = lanternsRef.current[idx];
      if (!mesh) return;

      // Update position (bobbing + float up)
      l.y += l.speed;
      
      const wobbleX = Math.sin(time * l.wobbleSpeed + l.seed) * l.wobbleScale;
      const wobbleZ = Math.cos(time * l.wobbleSpeed + l.seed) * l.wobbleScale;

      mesh.position.y = l.y;
      mesh.position.x = l.x + wobbleX;
      mesh.position.z = l.z + wobbleZ;
      mesh.rotation.y = time * 0.1 + l.seed;

      // Loop when going off screen (Y > 18)
      if (l.y > 18) {
        l.y = -14 - Math.random() * 5;
        l.x = THREE.MathUtils.randFloatSpread(22);
      }

      // Smooth opacity fading
      if (l.active) {
        if (l.currentOpacity < l.targetOpacity) {
          l.currentOpacity = Math.min(l.targetOpacity, l.currentOpacity + dt * 0.4);
        }
      } else {
        if (l.currentOpacity > 0) {
          l.currentOpacity = Math.max(0, l.currentOpacity - dt * 0.5);
          // Reset position to bottom once fully faded out
          if (l.currentOpacity === 0) {
            l.y = -14 - Math.random() * 5;
          }
        }
      }

      // Apply opacity and time to shader material uniforms
      if (mesh.material && mesh.material.uniforms) {
        mesh.material.uniforms.uOpacity.value = l.currentOpacity;
        mesh.material.uniforms.uTime.value = time;
      }
    });
  });

  if (!active) return null;

  return (
    <group>
      {pool.map((l, idx) => (
        <mesh
          key={idx}
          ref={(el) => (lanternsRef.current[idx] = el)}
          position={[l.x, l.y, l.z]}
          scale={[l.scale, l.scale * 1.35, l.scale]}
        >
          <cylinderGeometry args={[0.5, 0.42, 1.2, 8]} />
          <shaderMaterial
            transparent
            blending={l.layer === 2 ? THREE.AdditiveBlending : THREE.NormalBlending}
            depthWrite={l.layer !== 2}
            vertexShader={`
              varying vec2 vUv;
              varying float vLocalY;
              void main() {
                vUv = uv;
                vLocalY = position.y;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform vec3 uColorBase;
              uniform vec3 uColorGlow;
              uniform float uOpacity;
              uniform float uTime;
              uniform float uSeed;
              varying vec2 vUv;
              varying float vLocalY;
              
              void main() {
                // Map local Y from [-0.6, 0.6] to [0.0, 1.0]
                float pct = (vLocalY + 0.6) / 1.2;
                
                // Flickering glow at the bottom
                float flicker = sin(uTime * 6.0 + uSeed) * 0.08 + 0.92;
                vec3 bottomGlow = uColorGlow * flicker;
                
                // Gradient color
                vec3 color = mix(bottomGlow, uColorBase, pct);
                
                // Soft edge vignette on the cylinder sides
                float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
                vec3 finalColor = color * (0.6 + 0.4 * edge);
                
                gl_FragColor = vec4(finalColor, uOpacity);
              }
            `}
            uniforms={{
              uColorBase: { value: new THREE.Color(l.layer === 2 ? "#d97706" : "#b45309") },
              uColorGlow: { value: new THREE.Color("#fef08a") },
              uOpacity: { value: 0 },
              uTime: { value: 0 },
              uSeed: { value: l.seed }
            }}
          />
        </mesh>
      ))}
    </group>
  );
};

// Confetti Rain Layer (Falling rose petals, gold hearts, and warm sparkles)
const ConfettiRain = ({ count = 60, active }) => {
  const groupRef = useRef();

  const confettiData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const type = ['petal', 'heart', 'sparkle'][Math.floor(Math.random() * 3)];
      const color = type === 'petal'
        ? ['#f43f5e', '#ec4899', '#fda4af'][Math.floor(Math.random() * 3)] // rose petal tones
        : type === 'heart'
        ? '#fbbf24' // gold hearts
        : '#fef3c7'; // warm white sparkles
      
      data.push({
        x: THREE.MathUtils.randFloatSpread(25),
        y: 12 + Math.random() * 15,
        z: -6 - Math.random() * 14,
        type,
        color,
        fallSpeed: 0.015 + Math.random() * 0.025,
        swaySpeed: 0.5 + Math.random() * 1.0,
        swayAmp: 0.4 + Math.random() * 0.6,
        rotSpeed: 0.8 + Math.random() * 1.8,
        seed: Math.random() * 100,
        scale: type === 'petal' ? 0.08 + Math.random() * 0.08 : 0.05 + Math.random() * 0.05
      });
    }
    return data;
  }, [count]);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((mesh, idx) => {
      if (!mesh) return;
      const d = confettiData[idx];
      if (!d) return;

      d.y -= d.fallSpeed;
      const swayX = Math.sin(time * d.swaySpeed + d.seed) * d.swayAmp;
      const swayZ = Math.cos(time * d.swaySpeed * 0.8 + d.seed) * d.swayAmp * 0.4;

      mesh.position.set(d.x + swayX, d.y, d.z + swayZ);
      mesh.rotation.x = time * d.rotSpeed + d.seed;
      mesh.rotation.y = time * d.rotSpeed * 0.5;

      if (d.y < -12) {
        d.y = 12 + Math.random() * 5;
        d.x = THREE.MathUtils.randFloatSpread(25);
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {confettiData.map((d, idx) => (
        <mesh
          key={idx}
          position={[d.x, d.y, d.z]}
          scale={[d.scale, d.scale, d.scale]}
        >
          {d.type === 'petal' ? (
            <sphereGeometry args={[1, 5, 4]} />
          ) : d.type === 'heart' ? (
            <dodecahedronGeometry args={[0.7]} />
          ) : (
            <tetrahedronGeometry args={[0.5]} />
          )}
          <meshBasicMaterial
            color={d.color}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Pre-computed name spelling coordinates for SUCHI ❤️
const generateNamePoints = () => {
  const points = [];
  const S = [[1,5],[2,5],[3,5],[0,4],[0,3],[1,2.5],[2,2.5],[3,2],[3,1],[0,0],[1,0],[2,0]];
  const U = [[0,5],[0,4],[0,3],[0,2],[0,1],[1,0],[2,0],[3,5],[3,4],[3,3],[3,2],[3,1]];
  const C = [[1,5],[2,5],[3,5],[0,4],[0,3],[0,2],[0,1],[1,0],[2,0],[3,0]];
  const H = [[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],[1,2.5],[2,2.5],[3,5],[3,4],[3,3],[3,2],[3,1],[3,0]];
  const I = [[0,5],[1,5],[2,5],[1,4],[1,3],[1,2],[1,1],[0,0],[1,0],[2,0]];
  const Heart = [[1,4],[2,4],[3,4],[0,3],[4,3],[0,2],[4,2],[1,1],[3,1],[2,0]];

  const letters = [S, U, C, H, I, Heart];
  // Letter spacing: 4.8 units. Center horizontally.
  letters.forEach((letter, letterIdx) => {
    const xOffset = -12.0 + letterIdx * 4.8;
    letter.forEach(([lx, ly]) => {
      const scaledY = ly * 0.8;
      // Add slight noise to make particles spark organically
      for (let k = 0; k < 2; k++) {
        points.push({
          targetX: xOffset + lx * 0.65 + (Math.random() - 0.5) * 0.15,
          targetY: scaledY + 3.0 + (Math.random() - 0.5) * 0.15,
          targetZ: -10 + (Math.random() - 0.5) * 0.15
        });
      }
    });
  });
  return points;
};

// 3D Firework Particle Emitter (Rocket launches + Chrysanthemum/Peony/Heart/Name explosions)
const FireworkEmitter = ({ active, sceneState }) => {
  const groupRef = useRef();
  
  // Active rockets rising and active particle explosions
  const activeRockets = useRef([]);
  const activeExplosions = useRef([]);

  // Control flags to prevent multiple launches during states
  const singleGoldTriggered = useRef(false);
  const secondGoldTriggered = useRef(false);

  useEffect(() => {
    // Reset flags if intro
    if (sceneState === 'intro' || sceneState === 'main') {
      singleGoldTriggered.current = false;
      secondGoldTriggered.current = false;
    }
  }, [sceneState]);

  // Launch a new rocket
  const launchRocket = (originX, targetY, type, colorHex) => {
    const originZ = -10 - Math.random() * 4;
    
    // Create rocket mesh
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array([originX, -10, originZ]);
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(colorHex),
      size: 0.35,
      transparent: true,
      opacity: 1.0,
      depthWrite: false
    });
    
    const points = new THREE.Points(geom, mat);
    if (groupRef.current) groupRef.current.add(points);
    
    // Play whoosh SFX
    audioManager.playSuccessWarp(); // sweeping whoosh

    activeRockets.current.push({
      points,
      x: originX,
      y: -10,
      z: originZ,
      targetY,
      riseSpeed: 14 + Math.random() * 4,
      type,
      color: colorHex
    });
  };

  // Trigger explosions upon reaching target peak heights
  const explodeRocket = (rocket) => {
    const particleCount = rocket.type === 'name' ? 180 : 120;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    let namePoints = [];
    if (rocket.type === 'name') {
      namePoints = generateNamePoints();
    }

    const fireworkColor = new THREE.Color(rocket.color);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = rocket.x;
      positions[i * 3 + 1] = rocket.y;
      positions[i * 3 + 2] = rocket.z;

      if (rocket.type === 'chrysanthemum') {
        // Explodes outward with gravity trail speeds
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = 2.0 + Math.random() * 3.5;
        velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
        velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
        velocities[i * 3 + 2] = speed * Math.cos(phi);
      } else if (rocket.type === 'peony') {
        // Perfect spherical ring expansion
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = 3.2; // uniform expansion speed
        velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
        velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
        velocities[i * 3 + 2] = speed * Math.cos(phi);
      } else if (rocket.type === 'heart') {
        // Explodes in heart vectors
        const t = Math.random() * Math.PI * 2;
        const speed = 1.6 + Math.random() * 0.8;
        const vx = 16 * Math.pow(Math.sin(t), 3) * 0.15 * speed;
        const vy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.15 * speed;
        const vz = (Math.random() - 0.5) * 1.5;
        velocities[i * 3] = vx;
        velocities[i * 3 + 1] = vy;
        velocities[i * 3 + 2] = vz;
      } else if (rocket.type === 'name') {
        // Spell Name: velocities align towards target letter coords
        const pt = namePoints[i % namePoints.length];
        velocities[i * 3] = pt.targetX; // store targets in velocity array for lerping
        velocities[i * 3 + 1] = pt.targetY;
        velocities[i * 3 + 2] = pt.targetZ;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      color: fireworkColor,
      size: rocket.type === 'name' ? 0.28 : 0.22,
      transparent: true,
      opacity: 1.0,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geom, mat);
    if (groupRef.current) groupRef.current.add(points);

    // Play boom sound
    audioManager.playFirework();

    activeExplosions.current.push({
      points,
      velocities,
      originX: rocket.x,
      originY: rocket.y,
      originZ: rocket.z,
      type: rocket.type,
      age: 0,
      maxAge: rocket.type === 'name' ? 4.5 : 1.5 + Math.random() * 0.8
    });
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Timeline triggers
    if (sceneState === 'single-gold' && !singleGoldTriggered.current) {
      singleGoldTriggered.current = true;
      launchRocket(0, 3.5, 'chrysanthemum', '#fbbf24'); // golden chrysanthemum
    }

    if (sceneState === 'second-gold' && !secondGoldTriggered.current) {
      secondGoldTriggered.current = true;
      launchRocket(-3.5, 4.0, 'peony', '#fda4af'); // pink peony
    }




    // Periodic random celebration fireworks (sticking to theme colors: Rose Gold, Pink, Gold, Warm White)
    if (sceneState === 'finale' && active && Math.random() < 0.015 && activeExplosions.current.length < 6) {
      const types = ['chrysanthemum', 'peony', 'heart'];
      const type = types[Math.floor(Math.random() * types.length)];
      const colors = ['#fbbf24', '#fda4af', '#fce7f3', '#fffbeb']; // Gold, Pink, Rose Gold, Warm White
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const launchX = THREE.MathUtils.randFloatSpread(14);
      const targetY = 1.0 + Math.random() * 4.5;
      launchRocket(launchX, targetY, type, color);
    }

    // 1. Update active rising rockets
    for (let i = activeRockets.current.length - 1; i >= 0; i--) {
      const rk = activeRockets.current[i];
      rk.y += rk.riseSpeed * dt;
      
      // Update rocket buffer position
      const posAttribute = rk.points.geometry.attributes.position;
      posAttribute.setXYZ(0, rk.x, rk.y, rk.z);
      posAttribute.needsUpdate = true;

      // Explode at target peak height
      if (rk.y >= rk.targetY) {
        explodeRocket(rk);
        
        // Clean up rocket
        if (groupRef.current) groupRef.current.remove(rk.points);
        rk.points.geometry.dispose();
        rk.points.material.dispose();
        activeRockets.current.splice(i, 1);
      }
    }

    // 2. Update active exploding particles
    for (let i = activeExplosions.current.length - 1; i >= 0; i--) {
      const ex = activeExplosions.current[i];
      ex.age += dt;
      const posAttribute = ex.points.geometry.attributes.position;
      const array = posAttribute.array;

      if (ex.type === 'name') {
        // Name spelling firework: particles converge/lerp to letter coords
        const t = Math.min(ex.age / 1.2, 1.0); // take 1.2s to converge
        const easeFactor = 1 - Math.exp(-t * 4.5);
        
        for (let j = 0; j < posAttribute.count; j++) {
          const targetX = ex.velocities[j * 3];
          const targetY = ex.velocities[j * 3 + 1];
          const targetZ = ex.velocities[j * 3 + 2];

          // Lerp from origin to targets
          array[j * 3] = THREE.MathUtils.lerp(ex.originX, targetX, easeFactor);
          array[j * 3 + 1] = THREE.MathUtils.lerp(ex.originY, targetY, easeFactor);
          array[j * 3 + 2] = THREE.MathUtils.lerp(ex.originZ, targetZ, easeFactor);
        }
      } else {
        // Regular fireworks: physics-driven gravity pull and drag
        for (let j = 0; j < posAttribute.count; j++) {
          array[j * 3] += ex.velocities[j * 3] * dt;
          array[j * 3 + 1] += ex.velocities[j * 3 + 1] * dt - 1.8 * dt; // gravity
          array[j * 3 + 2] += ex.velocities[j * 3 + 2] * dt;

          ex.velocities[j * 3] *= 0.98;
          ex.velocities[j * 3 + 1] *= 0.98;
          ex.velocities[j * 3 + 2] *= 0.98;
        }
      }

      posAttribute.needsUpdate = true;
      ex.points.material.opacity = 1.0 - (ex.age / ex.maxAge);

      // Clean up dead explosions
      if (ex.age >= ex.maxAge) {
        if (groupRef.current) groupRef.current.remove(ex.points);
        ex.points.geometry.dispose();
        ex.points.material.dispose();
        activeExplosions.current.splice(i, 1);
      }
    }
  });

  return <group ref={groupRef} />;
};

// 3D Camera flight orchestrator
const CameraController = ({ sceneState, scrollProgress, ceremonyStep }) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 8));

  useEffect(() => {
    if (sceneState === 'intro') {
      targetPos.current.set(0, 0, 8);
    } else if (sceneState === 'dissolving') {
      targetPos.current.set(0, 0, 6.2);
    } else if (sceneState === 'heart') {
      targetPos.current.set(0, 0, 4.4);
    } else if (sceneState === 'warp') {
      targetPos.current.set(0, 0, -2.6);
      
      const timer = setTimeout(() => {
        camera.position.set(0, 0, 16);
        targetPos.current.set(0, 0, 16);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (sceneState === 'finale-candles' || sceneState === 'candles-extinguished' || sceneState === 'single-gold' || sceneState === 'second-gold') {
      if (['folding', 'envelope', 'transforming'].includes(ceremonyStep)) {
        targetPos.current.set(0, 1.2, 11.5); // Push in Z closer
      } else if (['flying', 'accepted'].includes(ceremonyStep)) {
        targetPos.current.set(0, 4.0, 12.5); // Pan up Y as lantern rises & star is born
      } else {
        targetPos.current.set(0, 1.2, 14); // Standard view (pans down for cake)
      }
    } else if (sceneState === 'finale') {
      targetPos.current.set(0, 0, 18);
    } else if (sceneState === 'ending-fade') {
      targetPos.current.set(0, 0, 36);
    } else if (sceneState === 'black') {
      targetPos.current.set(0, 0, 36);
    }
  }, [sceneState, ceremonyStep, camera]);

  useEffect(() => {
    if (sceneState !== 'main') return;

    const baseZ = 16 - scrollProgress * 28;
    const baseX = Math.sin(scrollProgress * Math.PI * 2.0) * 3.2;
    const baseY = Math.cos(scrollProgress * Math.PI * 1.5) * 1.8;
    
    targetPos.current.set(baseX, baseY, baseZ);
  }, [scrollProgress, sceneState]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const driftX = Math.sin(time * 0.45) * 0.12;
    const driftY = Math.cos(time * 0.35) * 0.12;
    const driftZ = Math.sin(time * 0.25) * 0.08;

    let orbitX = 0;
    let orbitY = 0;
    if (sceneState === 'finale') {
      orbitX = Math.sin(time * 0.18) * 1.8;
      orbitY = Math.cos(time * 0.18) * 1.0;
    }

    const finalTargetX = targetPos.current.x + driftX + orbitX;
    const finalTargetY = targetPos.current.y + driftY + orbitY;
    const finalTargetZ = targetPos.current.z + driftZ;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, finalTargetX, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, finalTargetY, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, finalTargetZ, 0.06);

    if (sceneState === 'main') {
      const lookZ = targetPos.current.z - 4.5;
      camera.lookAt(0, 0, lookZ);
    } else {
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

// Main Canvas container export
export const UniverseCanvas = ({ sceneState, scrollProgress, mouseCoords, ceremonyStep }) => {
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  const unlocked = sceneState !== 'intro' && sceneState !== 'dissolving' && sceneState !== 'heart' && sceneState !== 'warp';
  const isDarkState = ['candles-extinguished', 'single-gold', 'second-gold', 'finale', 'ending-fade', 'black'].includes(sceneState);
  const showNebula = unlocked && !isDarkState;
  const showLanterns = sceneState === 'main' || sceneState === 'finale-candles' || sceneState === 'candles-extinguished' || sceneState === 'single-gold' || sceneState === 'second-gold' || sceneState === 'finale' || sceneState === 'ending-fade';
  
  const showFireworks = sceneState === 'single-gold' || sceneState === 'second-gold' || sceneState === 'finale';
  const showConfetti = sceneState === 'finale';

  return (
    <div className="fixed inset-0 w-full h-full z-[2] bg-transparent pointer-events-none select-none">
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance", alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#f472b6" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#fbbf24" />

        {showNebula && <NebulaBackground />}

        {unlocked && <Starfield count={isMobile ? 700 : 1800} mouseCoords={mouseCoords} />}

        <FloatingLanterns active={showLanterns} ceremonyStep={ceremonyStep} sceneState={sceneState} />

        {unlocked && <ForegroundBokeh count={isMobile ? 15 : 35} />}

        <MorphingHeartParticles sceneState={sceneState} />

        {/* Sync active state flags inside FireworkEmitter */}
        <FireworkEmitter active={showFireworks} sceneState={sceneState} />

        {/* Slow falling romantic confetti layer */}
        <ConfettiRain count={isMobile ? 25 : 65} active={showConfetti} />

        <CameraController sceneState={sceneState} scrollProgress={scrollProgress} ceremonyStep={ceremonyStep} />
      </Canvas>
    </div>
  );
};

export default UniverseCanvas;
