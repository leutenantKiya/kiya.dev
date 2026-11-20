"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { Clay, Gloss, GroundShadow, RETRO, StudioLights } from "./studio";
import { useFrameloop } from "./useFrameloop";

const SNOW = "#f7f3ea";
const COAL = "#1c1917";

function SnowmanModel({ onPoke }: { onPoke: () => void }) {
  const { levelRef, reducedMotion } = useSeasonal();
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // Track the cursor across the whole page, not just this small canvas.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const level = levelRef.current ?? 0;
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, pointer.current.x * 0.7, 0.08);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -pointer.current.y * 0.3, 0.08);
    }
    if (arm.current) arm.current.rotation.z = -0.9 + Math.sin(t * 6) * 0.35;
    if (body.current) {
      // A small hop on the beat.
      body.current.position.y = -1.2 + level * 0.25;
    }
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={body} position={[0, -1.2, 0]} onClick={onPoke}>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.62, 48, 48]} />
          <Clay color={SNOW} />
        </mesh>
        <mesh position={[0, 1.38, 0]}>
          <sphereGeometry args={[0.45, 48, 48]} />
          <Clay color={SNOW} />
        </mesh>
        {[
          [1.52, 0.41],
          [1.34, 0.44],
          [1.16, 0.4],
        ].map(([y, z]) => (
          <mesh key={y} position={[0, y, z]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <Gloss color={COAL} />
          </mesh>
        ))}

        {/* knitted scarf: velvet loop, striped tail */}
        <mesh position={[0, 1.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 16, 40]} />
          <Clay color={RETRO.velvet} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.22, 1.66 - i * 0.09, 0.26]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.13, 0.085, 0.06]} />
            <Clay color={i % 2 === 0 ? RETRO.velvet : RETRO.cream} />
          </mesh>
        ))}

        <group ref={head} position={[0, 2.1, 0]}>
          <mesh>
            <sphereGeometry args={[0.34, 48, 48]} />
            <Clay color={SNOW} />
          </mesh>
          {[-0.11, 0.11].map((x) => (
            <mesh key={x} position={[x, 0.08, 0.3]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <Gloss color={COAL} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.055, 0.28, 16]} />
            <Gloss color="#e8650f" />
          </mesh>
          {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
            <mesh key={x} position={[x, -0.12 + Math.abs(i - 2) * 0.025, 0.3]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <Gloss color={COAL} />
            </mesh>
          ))}

          {/* top hat with a velvet band and holly */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.04, 32]} />
            <Clay color="#1a1416" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.23, 0.23, 0.38, 32]} />
            <Clay color="#1a1416" />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.235, 0.235, 0.07, 32]} />
            <Gloss color={RETRO.velvet} />
          </mesh>
          <group position={[0.17, 0.38, 0.14]}>
            {[-0.5, 0.5].map((r) => (
              <mesh key={r} rotation={[0, 0, r]} scale={[1, 0.45, 0.2]}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <Gloss color={RETRO.pine} />
              </mesh>
            ))}
            {[
              [0, 0.03],
              [0.03, -0.01],
              [-0.03, -0.01],
            ].map(([x, y], i) => (
              <mesh key={i} position={[x, y, 0.03]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <Gloss color="#d6182f" />
              </mesh>
            ))}
          </group>
        </group>

        {/* arms: the right one waves */}
        <mesh position={[-0.75, 1.5, 0]} rotation={[0, 0, 0.9]}>
          <cylinderGeometry args={[0.025, 0.035, 0.75, 6]} />
          <Clay color="#5b3418" />
        </mesh>
        <group ref={arm} position={[0.4, 1.35, 0]}>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 0.75, 6]} />
            <Clay color="#5b3418" />
          </mesh>
        </group>

        <GroundShadow y={0} scale={3} />
      </group>
    </Float>
  );
}

export default function Snowman({ onPoke }: { onPoke: () => void }) {
  const { reducedMotion } = useSeasonal();
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useFrameloop(wrapper, reducedMotion);

  return (
    <div ref={wrapper} className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.6, 5], fov: 36 }}
        gl={{ alpha: true, antialias: true }}
      >
        <StudioLights />
        <SnowmanModel onPoke={onPoke} />
      </Canvas>
    </div>
  );
}
