"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { useFrameloop } from "@/components/seasonal/three/useFrameloop";

/**
 * The hero's valley in three.js. One number, `night` (0 = day, 1 = night), drives everything: switching
 * the theme runs it over a few seconds, so the sun sets, clouds gather, the moon rises and the stars come
 * out (and the reverse at sunrise). Low-poly and flat-shaded so it reads as a cozy illustration.
 */

const TRANSITION_S = 4.2;

// ---------- noise and helpers ----------

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let f = 0, amp = 0.5, fr = 1;
  for (let i = 0; i < 5; i++) {
    f += amp * vnoise(x * fr, y * fr);
    fr *= 2.03;
    amp *= 0.5;
  }
  return f;
}
function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ground height: soft hills up front, ridged snowy mountains further back, a shallow valley in the middle. */
function heightAt(x: number, z: number) {
  const far = smoothstep(-30, -100, z);
  const hills = fbm(x * 0.045 + 3, z * 0.045) * 6;
  const ridge = 1 - Math.abs(2 * fbm(x * 0.017 + 11, z * 0.017 + 5) - 1);
  const mountains = Math.pow(ridge, 2.2) * 30 * far;
  const valley = -2.5 * Math.exp(-(x * x) / (2 * 22 * 22));
  return hills * (0.5 + 0.5 * far) + mountains + valley - 3;
}

// ---------- the day/night palette ----------

const C = (hex: string) => new THREE.Color(hex);
const PALETTE = {
  dayTop: C("#4d8fd6"), dayHorizon: C("#d3e7f6"),
  duskTop: C("#46467f"), duskHorizon: C("#ff9663"),
  nightTop: C("#050919"), nightHorizon: C("#1d1b3c"),
  cloudDay: C("#ffffff"), cloudDusk: C("#ffb08a"), cloudNight: C("#565b85"),
  groundDay: C("#5d7a4a"), groundNight: C("#0b0e1c"),
  sunHigh: C("#fff3c2"), sunLow: C("#ff8a3d"),
  sunLightHigh: C("#fff6e5"), sunLightLow: C("#ff9450"),
};

/** Everything the frame needs, derived from the night amount. */
function phase(night: number) {
  const sunset = Math.exp(-(((night - 0.45) / 0.19) ** 2));
  const t = smoothstep(0.25, 0.85, night);
  const sunEl = THREE.MathUtils.lerp(0.3, -0.2, smoothstep(0, 0.7, night));
  const moonEl = THREE.MathUtils.lerp(-0.22, 0.3, smoothstep(0.35, 1, night));
  const top = PALETTE.dayTop.clone().lerp(PALETTE.nightTop, t).lerp(PALETTE.duskTop, sunset * 0.65);
  const horizon = PALETTE.dayHorizon.clone().lerp(PALETTE.nightHorizon, t).lerp(PALETTE.duskHorizon, sunset * 0.85);
  return {
    sunset, t, sunEl, moonEl, top, horizon,
    stars: smoothstep(0.55, 0.95, night),
    clouds: smoothstep(0.12, 0.75, night),
    windows: smoothstep(0.35, 0.8, night),
  };
}

function direction(azimuth: number, elevation: number) {
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    -Math.cos(elevation) * Math.cos(azimuth),
  );
}
const SUN_AZ = 0.42;
const MOON_AZ = -0.4;

/** A soft round dot, for glows, smoke and window light. */
function softTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A pale moon face with a few soft craters. */
function moonTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f4ecd6";
  g.fillRect(0, 0, 256, 256);
  const r = rng(7);
  for (let i = 0; i < 22; i++) {
    const x = r() * 256, y = r() * 256, s = 6 + r() * 26;
    const grad = g.createRadialGradient(x, y, 0, x, y, s);
    grad.addColorStop(0, "rgba(190,178,150,0.55)");
    grad.addColorStop(1, "rgba(190,178,150,0)");
    g.fillStyle = grad;
    g.fillRect(x - s, y - s, s * 2, s * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- scene pieces ----------

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uSunVis;
  uniform vec3 uMoonDir;
  uniform float uMoonVis;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float h = max(dir.y, 0.0);
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
    float s = max(dot(dir, uSunDir), 0.0);
    col += uSunColor * (pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12) * uSunVis;
    float m = max(dot(dir, uMoonDir), 0.0);
    col += vec3(0.55, 0.6, 0.8) * pow(m, 40.0) * 0.35 * uMoonVis;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.6 + aPhase);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0, 0.97, 0.9), a * uOpacity * vTwinkle);
  }
`;

function terrainGeometry(snowline: number) {
  const plane = new THREE.PlaneGeometry(300, 170, 150, 85);
  plane.rotateX(-Math.PI / 2);
  plane.translate(0, 0, -60);
  const pos = plane.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  const geo = plane.toNonIndexed();
  plane.dispose();

  // One colour per face, picked from the face's height, for the low-poly look.
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const grass = [C("#6f9a5f"), C("#5e8c52"), C("#86a865")];
  const rock = [C("#7d8392"), C("#666b78")];
  const snow = C("#f3f6fb");
  const col = new THREE.Color();
  for (let f = 0; f < p.count; f += 3) {
    const cx = (p.getX(f) + p.getX(f + 1) + p.getX(f + 2)) / 3;
    const cz = (p.getZ(f) + p.getZ(f + 1) + p.getZ(f + 2)) / 3;
    const cy = (p.getY(f) + p.getY(f + 1) + p.getY(f + 2)) / 3;
    const n = hash(Math.round(cx * 3), Math.round(cz * 3));
    const jitter = (n - 0.5) * 3;
    if (cy + jitter > snowline) col.copy(snow);
    else if (cy + jitter > 5) col.copy(rock[n > 0.5 ? 0 : 1]);
    else col.copy(grass[Math.floor(n * 3)]);
    for (let k = 0; k < 3; k++) col.toArray(colors, (f + k) * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function Terrain() {
  const { festive } = useSeasonal();
  const geo = useMemo(() => terrainGeometry(festive ? 11 : 18), [festive]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors flatShading roughness={1} />
    </mesh>
  );
}

function Pines() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geo, spots } = useMemo(() => {
    const a = new THREE.ConeGeometry(0.95, 2.2, 7);
    a.translate(0, 1.5, 0);
    const b = new THREE.ConeGeometry(0.68, 1.7, 7);
    b.translate(0, 2.6, 0);
    const trunk = new THREE.CylinderGeometry(0.14, 0.18, 0.6, 5);
    trunk.translate(0, 0.3, 0);
    const geo = mergeGeometries([a, b, trunk])!;
    const r = rng(42);
    const spots: { x: number; y: number; z: number; s: number; shade: number }[] = [];
    while (spots.length < 170) {
      const x = (r() - 0.5) * 150;
      const z = 18 - r() * 62;
      const y = heightAt(x, z);
      if (y > 4.5) continue;
      if (Math.abs(x) < 5 && z > 4) continue;
      if (HOUSES.some((h) => Math.hypot(h.x - x, h.z - z) < 3.2)) continue;
      spots.push({ x, y, z, s: 0.7 + r() * 0.9, shade: r() });
    }
    return { geo, spots };
  }, []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const dark = C("#2b5735"), light = C("#3f7046");
    spots.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.y - 0.2, p.z), q, new THREE.Vector3(p.s, p.s, p.s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, dark.clone().lerp(light, p.shade));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [spots]);

  return (
    <instancedMesh ref={ref} args={[geo, undefined, spots.length]}>
      <meshStandardMaterial flatShading roughness={1} />
    </instancedMesh>
  );
}

// Two little clusters on the slopes either side of the portrait, clear of the intro card and the tree.
const HOUSES = [
  { x: -26, z: -24, r: 0.4, s: 1.7 },
  { x: -20.5, z: -28, r: -0.2, s: 1.5 },
  { x: -31, z: -31, r: 0.6, s: 1.6 },
  { x: 14, z: -22, r: -0.5, s: 1.6 },
  { x: 19.5, z: -27, r: 0.3, s: 1.5 },
];

/** Cabins whose windows light up and chimneys smoke as night falls. */
function Village({ night, glow }: { night: React.RefObject<number>; glow: THREE.Texture }) {
  // One shared window material: every window lights up together.
  const windowMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3d3a3a", emissive: "#ffc865", emissiveIntensity: 0.15 }),
    [],
  );
  const halos = useRef<(THREE.Sprite | null)[]>([]);
  const smoke = useRef<(THREE.Sprite | null)[]>([]);

  useFrame(({ clock }) => {
    const w = phase(night.current).windows;
    windowMat.emissiveIntensity = 0.15 + w * 2.4;
    halos.current.forEach((h) => h && ((h.material as THREE.SpriteMaterial).opacity = w * 0.75));
    const t = clock.elapsedTime;
    smoke.current.forEach((sp, i) => {
      if (!sp) return;
      const k = (t * 0.22 + (i % 4) / 4) % 1;
      sp.position.y = 2.2 + k * 3;
      sp.position.x = 0.35 + k * 0.8;
      sp.scale.setScalar(0.4 + k * 1.3);
      (sp.material as THREE.SpriteMaterial).opacity = (1 - k) * 0.45;
    });
  });

  return (
    <group>
      {HOUSES.map((h, i) => (
        <group key={i} position={[h.x, heightAt(h.x, h.z) - 0.1, h.z]} rotation={[0, h.r, 0]} scale={h.s}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[1.8, 1.3, 1.5]} />
            <meshStandardMaterial color="#efe1c6" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 1.75, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.55, 0.95, 4]} />
            <meshStandardMaterial color="#b14f39" flatShading roughness={1} />
          </mesh>
          <mesh position={[0.45, 2.0, -0.2]}>
            <boxGeometry args={[0.22, 0.7, 0.22]} />
            <meshStandardMaterial color="#8a3f30" flatShading roughness={1} />
          </mesh>
          {[-0.45, 0.45].map((wx) => (
            <mesh key={wx} position={[wx, 0.7, 0.76]} material={windowMat}>
              <planeGeometry args={[0.36, 0.42]} />
            </mesh>
          ))}
          <sprite ref={(s) => { halos.current[i] = s; }} position={[0, 0.8, 1]} scale={[3.6, 3.6, 1]}>
            <spriteMaterial map={glow} color="#ffc35c" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          {i % 2 === 0 &&
            [0, 1, 2, 3].map((k) => (
              <sprite key={k} ref={(s) => { smoke.current[i * 4 + k] = s; }} position={[0.45, 2.3, -0.2]}>
                <spriteMaterial map={glow} color="#e9e4dc" transparent opacity={0} depthWrite={false} />
              </sprite>
            ))}
        </group>
      ))}
    </group>
  );
}

function Clouds({ night }: { night: React.RefObject<number> }) {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1, transparent: true, opacity: 0.96 }), []);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const clouds = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 20 }, (_, i) => ({
      x: (r() - 0.5) * 240,
      y: 15 + r() * 15,
      z: -60 - r() * 60,
      speed: 0.5 + r() * 0.9,
      // the first few are out by day; the rest gather as night comes
      threshold: i < 6 ? -1 : (i - 6) / 14,
      puffs: Array.from({ length: 5 + Math.floor(r() * 4) }, () => ({
        x: (r() - 0.5) * 11,
        y: (r() - 0.5) * 2.2,
        z: (r() - 0.5) * 4,
        s: 2.2 + r() * 2.4,
      })),
    }));
  }, []);
  const puff = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);

  useFrame((_, dt) => {
    const ph = phase(night.current);
    m.color.copy(PALETTE.cloudDay).lerp(PALETTE.cloudNight, ph.t).lerp(PALETTE.cloudDusk, ph.sunset * 0.7);
    // lit from inside a little, so the shaded sides stay soft instead of turning to rock
    m.emissive.copy(m.color).multiplyScalar(0.5 - ph.t * 0.2);
    m.opacity = 0.95 - ph.t * 0.2;
    const step = Math.min(dt, 0.1);
    clouds.forEach((c, i) => {
      const g = groups.current[i];
      if (!g) return;
      g.position.x += c.speed * step;
      if (g.position.x > 125) g.position.x = -125;
      const s = c.threshold < 0 ? 1 : smoothstep(c.threshold, c.threshold + 0.18, ph.clouds);
      g.scale.setScalar(Math.max(s, 0.0001));
      g.visible = s > 0.01;
    });
  });

  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} ref={(g) => { groups.current[i] = g; }} position={[c.x, c.y, c.z]}>
          {c.puffs.map((p, k) => (
            <mesh
              key={k}
              geometry={puff}
              material={m}
              position={[p.x, p.y, p.z]}
              scale={[p.s * 1.25, p.s * 0.8, p.s]}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function Sky({ night, glow }: { night: React.RefObject<number>; glow: THREE.Texture }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const moonTex = useMemo(() => moonTexture(), []);
  const sun = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const sunLight = useRef<THREE.DirectionalLight>(null);
  const moonLight = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  const skyUniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3() },
      uSunColor: { value: new THREE.Color() },
      uSunVis: { value: 1 },
      uMoonDir: { value: new THREE.Vector3() },
      uMoonVis: { value: 0 },
    }),
    [],
  );

  const stars = useMemo(() => {
    const r = rng(3);
    const count = 900;
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const az = (r() - 0.5) * Math.PI * 1.4;
      const el = 0.06 + Math.pow(r(), 0.8) * 1.3;
      direction(az, el).multiplyScalar(380).toArray(pos, i * 3);
      size[i] = 1.2 + Math.pow(r(), 3) * 3.4;
      ph[i] = r() * 6.28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    return geo;
  }, []);
  const starUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: gl.getPixelRatio() } }),
    [gl],
  );

  useFrame(({ clock, size }) => {
    const ph = phase(night.current);
    // Narrow (phone) screens see less sky sideways: pull the sun and moon in toward the middle.
    const spread = Math.min(1, size.width / size.height / 1.7);
    const sunDir = direction(SUN_AZ * spread, ph.sunEl);
    const moonDir = direction(MOON_AZ * spread, ph.moonEl);
    const sunLow = 1 - smoothstep(0.02, 0.28, ph.sunEl);
    const sunColor = PALETTE.sunHigh.clone().lerp(PALETTE.sunLow, sunLow);

    skyUniforms.uTop.value.copy(ph.top);
    skyUniforms.uHorizon.value.copy(ph.horizon);
    skyUniforms.uSunDir.value.copy(sunDir);
    skyUniforms.uSunColor.value.copy(sunColor);
    skyUniforms.uSunVis.value = smoothstep(-0.12, 0.05, ph.sunEl);
    skyUniforms.uMoonDir.value.copy(moonDir);
    skyUniforms.uMoonVis.value = smoothstep(-0.1, 0.1, ph.moonEl);
    starUniforms.uTime.value = clock.elapsedTime;
    starUniforms.uOpacity.value = ph.stars;
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(ph.horizon);

    if (sun.current) {
      sun.current.position.copy(sunDir).multiplyScalar(300);
      sun.current.children.forEach((c) => ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).color.copy(sunColor));
    }
    if (moon.current) moon.current.position.copy(moonDir).multiplyScalar(290);
    if (sunLight.current) {
      sunLight.current.position.copy(sunDir).multiplyScalar(100);
      sunLight.current.intensity = 2.6 * smoothstep(-0.06, 0.2, ph.sunEl);
      sunLight.current.color.copy(PALETTE.sunLightHigh).lerp(PALETTE.sunLightLow, sunLow);
    }
    if (moonLight.current) {
      moonLight.current.position.copy(moonDir).multiplyScalar(100);
      moonLight.current.intensity = 0.9 * smoothstep(-0.05, 0.2, ph.moonEl);
    }
    if (hemi.current) {
      hemi.current.color.copy(ph.top).lerp(ph.horizon, 0.5);
      hemi.current.groundColor.copy(PALETTE.groundDay).lerp(PALETTE.groundNight, ph.t);
      hemi.current.intensity = THREE.MathUtils.lerp(1.25, 0.55, ph.t);
    }
  });

  return (
    <>
      <mesh renderOrder={-2}>
        <sphereGeometry args={[450, 32, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={skyUniforms}
          vertexShader={skyVertex}
          fragmentShader={skyFragment}
        />
      </mesh>
      <points geometry={stars} renderOrder={-1}>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={starUniforms}
          vertexShader={starVertex}
          fragmentShader={starFragment}
        />
      </points>
      <group ref={sun}>
        <mesh>
          <sphereGeometry args={[11, 32, 16]} />
          <meshBasicMaterial fog={false} toneMapped={false} />
        </mesh>
        <sprite scale={[110, 110, 1]}>
          <spriteMaterial map={glow} transparent opacity={0.55} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <group ref={moon}>
        <mesh rotation={[0.3, -0.6, 0]}>
          <sphereGeometry args={[8, 32, 16]} />
          <meshBasicMaterial map={moonTex} fog={false} toneMapped={false} />
        </mesh>
        <sprite scale={[70, 70, 1]}>
          <spriteMaterial map={glow} color="#cdd6ff" transparent opacity={0.3} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <directionalLight ref={sunLight} />
      <directionalLight ref={moonLight} color="#9fb2ff" />
      <hemisphereLight ref={hemi} />
    </>
  );
}

/** Eases `night` toward the theme, and drifts the camera with the pointer and the scroll. */
function Director({ night, target, reduced }: { night: React.RefObject<number>; target: React.RefObject<number>; reduced: boolean }) {
  const camera = useThree((s) => s.camera);
  const pointer = useRef({ x: 0, y: 0 });
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1) / TRANSITION_S;
    const diff = target.current - night.current;
    night.current = reduced || Math.abs(diff) <= step ? target.current : night.current + Math.sign(diff) * step;

    const hp = Math.min(1, window.scrollY / (window.innerHeight * 0.8));
    const px = reduced ? 0 : pointer.current.x;
    const py = reduced ? 0 : pointer.current.y;
    camera.position.x += (px * 2.2 - camera.position.x) * 0.04;
    camera.position.y += (6 + hp * 5 - py * 0.8 - camera.position.y) * 0.08;
    look.set(camera.position.x * 0.3, 12.5 - hp * 3, -60);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
  const night = useRef(isDark() ? 1 : 0);
  const target = useRef(night.current);
  const invalidate = useThree((s) => s.invalidate);
  const glow = useMemo(() => softTexture(), []);

  // The theme lives on <html data-theme>; follow it, whoever changes it.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      target.current = isDark() ? 1 : 0;
      invalidate();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [invalidate]);

  return (
    <>
      <fog attach="fog" args={["#d3e7f6", 45, 200]} />
      <Director night={night} target={target} reduced={reduced} />
      <Sky night={night} glow={glow} />
      <Clouds night={night} />
      <Terrain />
      <Pines />
      <Village night={night} glow={glow} />
    </>
  );
}

export default function SkyScene({ onReady }: { onReady?: () => void }) {
  const { reducedMotion } = useSeasonal();
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useFrameloop(wrapper, reducedMotion);

  return (
    <div ref={wrapper} className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        flat
        camera={{ position: [0, 6, 30], fov: 40, near: 0.5, far: 1000 }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onCreated={() => onReady?.()}
      >
        <Scene reduced={reducedMotion} />
      </Canvas>
    </div>
  );
}
