"use client";

import { forwardRef, useMemo } from "react";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/*
 * One material set for every holiday object, so the tree and the snowman read as one scene:
 * clay for bodies, gloss for ornaments, gold for metal, glow for anything that lights up.
 */

/** 90s living-room Christmas: velvet red, pine, old gold, cream, tungsten bulbs. */
export const RETRO = {
  velvet: "#b3132b",
  cranberry: "#7a0f1e",
  pine: "#1f4d2b",
  pineLight: "#2f6b3a",
  gold: "#d4a64a",
  cream: "#f3e6c9",
  bulbs: ["#ff3b30", "#ffb02e", "#2f7bff", "#27c46b", "#ff5fa2"],
};

export function Clay({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.82}
      sheen={0.25}
      sheenRoughness={0.7}
      sheenColor="#ffe9d1"
    />
  );
}

export function Gloss({ color }: { color: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.18}
      metalness={0.15}
      clearcoat={1}
      clearcoatRoughness={0.08}
    />
  );
}

export function Gold() {
  return (
    <meshStandardMaterial
      color="#f5c451"
      metalness={1}
      roughness={0.32}
      emissive="#f59e0b"
      emissiveIntensity={0.6}
    />
  );
}

/** Emissive past 1.0 is what the bloom pass picks up. toneMapped=false keeps it bright. */
export function Glow({ color, intensity = 2 }: { color: string; intensity?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      toneMapped={false}
    />
  );
}

/** Warm key, cool rim, soft fill. Built from lightformers, so no HDR file is downloaded. */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#ffe2b8" />
      <directionalLight position={[-4, 2.5, -3]} intensity={1.1} color="#8fb8ff" />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2.2} color="#ffd9a8" position={[3, 4, 5]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#9cc2ff" position={[-5, 2, -4]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={4} />
      </Environment>
    </>
  );
}

export function GroundShadow({ y, scale }: { y: number; scale: number }) {
  return (
    <ContactShadows position={[0, y, 0]} scale={scale} blur={2.6} opacity={0.55} far={3} resolution={256} color="#000000" />
  );
}

let haloTexture: THREE.CanvasTexture | null = null;

/** Soft radial dot, drawn once and shared by every halo. */
function getHaloTexture() {
  if (haloTexture) return haloTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  haloTexture = new THREE.CanvasTexture(canvas);
  return haloTexture;
}

/**
 * Glow as an additive sprite instead of a bloom pass: a post-processing pass makes the
 * canvas opaque and shows as a dark box over the page.
 */
export const Halo = forwardRef<THREE.Sprite, { color: string; size: number; opacity?: number }>(
  function Halo({ color, size, opacity = 0.7 }, ref) {
    const map = useMemo(getHaloTexture, []);
    return (
      <sprite ref={ref} scale={[size, size, 1]}>
        <spriteMaterial
          map={map}
          color={color}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    );
  },
);
