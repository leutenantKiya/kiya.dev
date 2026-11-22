"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { Clay, Gloss, Gold, GroundShadow, Halo, RETRO, StudioLights } from "./studio";
import { useFrameloop } from "./useFrameloop";

const TIERS = [
  { y: 0.35, r: 1.3, h: 1.35, color: RETRO.pine },
  { y: 1.05, r: 1.05, h: 1.2, color: RETRO.pine },
  { y: 1.7, r: 0.8, h: 1.05, color: RETRO.pineLight },
  { y: 2.3, r: 0.52, h: 0.85, color: RETRO.pineLight },
];
const BAUBLE_COLORS = [RETRO.velvet, RETRO.gold, RETRO.velvet, RETRO.cream, RETRO.cranberry];

/** A soft clay cone whose bottom edge ripples like a branch skirt. */
function tierGeometry(radius: number, height: number) {
  const points: THREE.Vector2[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Slight outward bulge so it reads as soft, not a hard cone.
    const r = radius * t * (1 + 0.12 * Math.sin(Math.PI * t));
    points.push(new THREE.Vector2(Math.max(r, 0.001), height * (1 - t)));
  }
  points.push(new THREE.Vector2(radius * 0.92, -0.06));
  points.push(new THREE.Vector2(radius * 0.5, -0.08));
  // Close the underside: the camera sits below the upper tiers and would see into them.
  points.push(new THREE.Vector2(0.001, -0.08));

  const geo = new THREE.LatheGeometry(points, 64);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const depth = Math.min(1, Math.max(0, 1 - v.y / height));
    const wave = 1 + 0.07 * Math.sin(Math.atan2(v.z, v.x) * 9) * depth * depth;
    pos.setXYZ(i, v.x * wave, v.y, v.z * wave);
  }
  geo.computeVertexNormals();
  return geo;
}

function starGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.34 : 0.15;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

/** Points just outside the widest tier surface at each height, wrapping the tree. */
function spiral(count: number, inset: number, turns: number, phase = 0) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 0.3 + t * 2.75;
    let surface = 0;
    for (const tier of TIERS) {
      if (y >= tier.y && y <= tier.y + tier.h) {
        const k = (tier.y + tier.h - y) / tier.h;
        surface = Math.max(surface, tier.r * k * (1 + 0.12 * Math.sin(Math.PI * k)));
      }
    }
    const radius = Math.max(0.08, surface) + inset;
    const angle = phase + t * Math.PI * 2 * turns;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
  }
  return points;
}

function Tree() {
  const { levelRef, reducedMotion } = useSeasonal();
  const group = useRef<THREE.Group>(null);
  const star = useRef<THREE.Mesh>(null);
  const bulbs = useRef<(THREE.Mesh | null)[]>([]);
  const halos = useRef<(THREE.Sprite | null)[]>([]);
  const starHalo = useRef<THREE.Sprite>(null);
  const spin = useRef(0);
  const [hovered, setHovered] = useState(false);

  const tiers = useMemo(() => TIERS.map((t) => tierGeometry(t.r, t.h)), []);
  const star3 = useMemo(starGeometry, []);
  const tinsel = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral(120, 0.03, 3.5, 1.2)), 400, 0.028, 6),
    [],
  );
  const bulbPoints = useMemo(() => spiral(34, 0.06, 4.5), []);
  const baubles = useMemo(() => spiral(14, 0.08, 2.5, 2.4), []);

  useFrame((state, delta) => {
    const level = levelRef.current ?? 0;
    const t = state.clock.elapsedTime;
    // How far the hero has scrolled away: the camera leans in and the tree turns with it.
    const scroll = Math.min(1, window.scrollY / window.innerHeight);

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 7.6 - scroll * 1.1, 0.08);
    state.camera.lookAt(0, 0.1, 0);

    if (group.current) {
      spin.current = Math.max(0, spin.current - delta * 4);
      group.current.rotation.y += delta * (0.18 + spin.current);
      group.current.rotation.y += (scroll * Math.PI - (group.current.userData.scroll ?? 0));
      group.current.userData.scroll = scroll * Math.PI;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.08, 0.05);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -state.pointer.x * 0.06, 0.05);
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, 1 + level * 0.05, 0.3));
    }
    if (star.current) {
      star.current.rotation.y = t * 1.1;
      (star.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(t * 2.5) * 0.3 + level * 3;
    }
    if (starHalo.current) {
      starHalo.current.material.opacity = 0.55 + Math.sin(t * 2.5) * 0.1 + level * 0.4;
    }
    bulbs.current.forEach((bulb, i) => {
      if (!bulb) return;
      const speed = hovered ? 8 : 2.4;
      // Old tungsten strings: slow warm fade, not a strobe.
      const fade = 0.5 + 0.5 * Math.sin(t * speed + i * 2.1);
      (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + fade * 2.2 + level * 5;
      const halo = halos.current[i];
      if (halo) halo.material.opacity = 0.25 + fade * 0.45 + level * 0.5;
    });
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group
        ref={group}
        position={[0, -1.6, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (!reducedMotion) spin.current = 6;
        }}
      >
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.17, 0.22, 0.45, 16]} />
          <Clay color="#5b3418" />
        </mesh>

        {TIERS.map((tier, i) => (
          <mesh key={tier.y} geometry={tiers[i]} position={[0, tier.y, 0]}>
            <Clay color={tier.color} />
          </mesh>
        ))}

        <mesh geometry={tinsel}>
          <Gold />
        </mesh>

        <mesh ref={star} geometry={star3} position={[0, 3.35, 0]}>
          <Gold />
        </mesh>
        <group position={[0, 3.35, 0]}>
          <Halo ref={starHalo} color="#ffcf7a" size={1.6} opacity={0.6} />
        </group>
        <pointLight position={[0, 3.35, 0.5]} color="#ffcf7a" intensity={5} distance={4} />

        {bulbPoints.map((p, i) => {
          const color = RETRO.bulbs[i % RETRO.bulbs.length];
          return (
            <group key={`b${i}`} position={p}>
              <mesh
                scale={[1, 1.45, 1]}
                ref={(el) => {
                  bulbs.current[i] = el;
                }}
              >
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
              </mesh>
              <Halo
                ref={(el) => {
                  halos.current[i] = el;
                }}
                color={color}
                size={0.42}
                opacity={0.5}
              />
            </group>
          );
        })}

        {baubles.map((p, i) => (
          <mesh key={`o${i}`} position={p}>
            <sphereGeometry args={[0.11, 24, 24]} />
            <Gloss color={BAUBLE_COLORS[i % BAUBLE_COLORS.length]} />
          </mesh>
        ))}

        {[
          { p: [0.85, 0.2, 0.6], s: [0.48, 0.4, 0.48], c: RETRO.velvet, r: RETRO.gold },
          { p: [-0.8, 0.16, 0.65], s: [0.38, 0.32, 0.38], c: RETRO.cream, r: RETRO.velvet },
          { p: [0.15, 0.13, 1.05], s: [0.32, 0.26, 0.32], c: RETRO.pine, r: RETRO.gold },
          { p: [1.25, 0.11, 1.0], s: [0.26, 0.22, 0.26], c: RETRO.gold, r: RETRO.velvet },
        ].map((g, i) => (
          <group key={i} position={g.p as [number, number, number]} rotation={[0, i * 0.6, 0]}>
            <mesh>
              <boxGeometry args={g.s as [number, number, number]} />
              <Clay color={g.c} />
            </mesh>
            <mesh>
              <boxGeometry args={[g.s[0] + 0.012, g.s[1] + 0.012, 0.07]} />
              <Gloss color={g.r} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.07, g.s[1] + 0.012, g.s[2] + 0.012]} />
              <Gloss color={g.r} />
            </mesh>
            <mesh position={[0, g.s[1] / 2 + 0.05, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
              <torusGeometry args={[0.07, 0.025, 8, 16]} />
              <Gloss color={g.r} />
            </mesh>
          </group>
        ))}

        <GroundShadow y={-0.01} scale={5} />
      </group>
    </Float>
  );
}

export default function ChristmasTree() {
  const { reducedMotion } = useSeasonal();
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useFrameloop(wrapper, reducedMotion);

  return (
    <div ref={wrapper} className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        // framed with room above the star, which bobs with the Float
        camera={{ position: [0, 1.35, 8.6], fov: 36 }}
        gl={{ alpha: true, antialias: true }}
      >
        <StudioLights />
        <Tree />
      </Canvas>
    </div>
  );
}
