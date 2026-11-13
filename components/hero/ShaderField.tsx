"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { color } from "@/lib/design/tokens";

/**
 * WebGL background field.
 *
 * A single full-screen plane running domain-warped fractal noise. Chosen
 * over a particle system or a mesh gradient for three reasons: it is one
 * draw call, it never tears on resize, and the motion is slow enough to
 * read as atmosphere rather than as a screensaver.
 *
 * The field is intentionally almost invisible — around 6% peak luminance.
 * On a near-black page a background that announces itself competes with
 * the type, and the brief is minimalist. You should notice it only when
 * it is switched off.
 *
 * Degrades in three steps: no WebGL -> CSS gradient fallback;
 * reduced-motion -> a single static frame; context lost -> fallback again.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uAspect;
  uniform vec3  uSignal;
  uniform float uIntensity;

  // Hash-based value noise. Cheaper than simplex and visually
  // indistinguishable once fractalised and heavily blurred by the
  // low alpha we composite at.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uAspect;
    float t = uTime * 0.018;

    // Domain warp: offset the sample point by another noise field. This is
    // what turns bland fbm into something that looks like drifting ink.
    vec2 q = vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 + vec2(5.2, 1.3) - t));
    float f = fbm(uv * 2.2 + q * 1.1);

    // Ridge the field so bright filaments emerge instead of soft blobs.
    float ridge = 1.0 - abs(f * 2.0 - 1.0);
    ridge = pow(ridge, 3.4);

    // Fade hard toward the bottom so the field never fights the hero copy.
    float vignette = smoothstep(1.15, 0.1, length(uv * vec2(0.72, 1.0)));
    float topBias = smoothstep(-0.15, 0.85, 1.0 - vUv.y);

    float a = ridge * vignette * topBias * uIntensity;
    gl_FragColor = vec4(uSignal * a, a);
  }
`;

function Field({ intensity, animate }: { intensity: number; animate: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: new THREE.Vector2(1, 1) },
      uSignal: { value: new THREE.Color(color.signal) },
      uIntensity: { value: intensity },
    }),
    [intensity],
  );

  useFrame((state, delta) => {
    if (!mat.current) return;
    if (animate) mat.current.uniforms.uTime.value += delta;
    const { width, height } = state.size;
    mat.current.uniforms.uAspect.value.set(Math.max(1, width / height), 1);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** Static CSS stand-in. Also what renders before hydration. */
function Fallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(195,245,60,0.08), transparent 68%)",
      }}
    />
  );
}

export function ShaderField({ intensity = 0.42 }: { intensity?: number }) {
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAnimate(!mq.matches);
    sync();
    mq.addEventListener("change", sync);

    // Feature-detect rather than assume. Remote desktops, locked-down
    // laptops and some venue machines ship without a GL context.
    try {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2") && !probe.getContext("webgl")) setFailed(true);
    } catch {
      setFailed(true);
    }

    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!mounted || failed) return <Fallback />;

  return (
    <div aria-hidden className="absolute inset-0">
      <Canvas
        // Capped DPR: the field is low-frequency, so rendering it at 3x on
        // a retina display costs frames and buys nothing visible.
        dpr={[1, 1.5]}
        frameloop={animate ? "always" : "demand"}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setFailed(true);
          });
        }}
      >
        <Field intensity={intensity} animate={animate} />
      </Canvas>
    </div>
  );
}
