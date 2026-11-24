"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useFrameloop } from "@/components/seasonal/three/useFrameloop";
import data from "./room-parts.json";

/**
 * Kiya's room: a cutaway corner diorama built from the img2threejs sculpt spec (.img2threejs/, exported
 * by build_spec.py into room-parts.json). One number, `night` (0 = day, 1 = night), follows the theme
 * and drives the light: sun through the window by day, string lights, lamp and monitor by night.
 * `progress` (0-1) comes from the scroll and flies the camera from the whole room into the monitor.
 */

type Part = {
  id: string;
  prim: string;
  dims: [number, number, number];
  pos: [number, number, number];
  rot: [number, number, number];
  mat: string;
  tube?: { points: [number, number, number][]; radius: number };
  torus?: number;
};
type Mat = { color: string; roughness: number; metalness: number; emissive: string | null; emissiveIntensity: number };

const PARTS = data.parts as Part[];
const MATS = data.materials as Record<string, Mat>;

export type Screen = { title: string; image: string };

const TRANSITION_S = 2.5;
const SKY_DAY = new THREE.Color("#b9dcf7");
const SKY_NIGHT = new THREE.Color("#1b2442");
const GLOW_DAY = new THREE.Color("#9ec3ea");
const GLOW_NIGHT = new THREE.Color("#2a3a70");
// Camera path: whole room -> desk -> into the monitor (its screen is at z -0.925, centre -0.28, 1.225).
// The first point is recomputed every frame so the whole room fits the free part of the stage.
const ROOM_CENTER = new THREE.Vector3(0.3, 0.95, -0.1);
const ROOM_RADIUS = 1.95;
const START_DIR = new THREE.Vector3(-2.4, 1.5, 4.75).normalize();
const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.3, 2.45, 4.3),
  new THREE.Vector3(-1.2, 1.9, 2.6),
  new THREE.Vector3(-0.45, 1.4, 0.9),
  new THREE.Vector3(-0.28, 1.235, -0.6),
]);
const LOOK = new THREE.CatmullRomCurve3([
  ROOM_CENTER.clone(),
  new THREE.Vector3(-0.05, 1.05, -0.7),
  new THREE.Vector3(-0.25, 1.18, -0.92),
  new THREE.Vector3(-0.28, 1.225, -0.95),
]);

export type Frame = { left: number; top: number; right: number; bottom: number };

// C major from C4, then the sharps that sit after white keys 0,1,3,4,5,7,8,10,11,12.
const WHITE_HZ = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77];
const BLACK_HZ = [277.18, 311.13, 369.99, 415.3, 466.16, 554.37, 622.25, 739.99, 830.61, 932.33];

let audio: AudioContext | null = null;
function playNote(hz: number) {
  audio ??= new AudioContext();
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.value = hz;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + 1.25);
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function letterTexture(letter: string, bg: string, ink: string) {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = ink;
    g.font = "800 86px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(letter, 64, 70);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draws an image like CSS object-fit: cover. */
function cover(g: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  g.drawImage(img, (img.width - sw) / 2, 0, sw, sh, x, y, w, h);
}

/** The monitor: a small desktop that cycles through Kiya's project screenshots. */
function useScreenTexture(screens: Screen[], reduced: boolean) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 600;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);

  useEffect(() => {
    let alive = true;
    let index = 0;
    const images: (HTMLImageElement | null)[] = screens.map(() => null);
    const g = canvas.getContext("2d")!;
    const paint = () => {
      const s = screens[index];
      g.fillStyle = "#151b2b";
      g.fillRect(0, 0, 1000, 600);
      g.fillStyle = "#222a3d";
      g.fillRect(0, 0, 1000, 44);
      ["#e5675a", "#e9b949", "#71b86a"].forEach((c, i) => {
        g.fillStyle = c;
        g.beginPath();
        g.arc(28 + i * 26, 22, 8, 0, Math.PI * 2);
        g.fill();
      });
      g.fillStyle = "#c9d2e6";
      g.font = "500 22px system-ui, sans-serif";
      g.textAlign = "center";
      g.fillText(`kiya.dev / work / ${s.title}`, 500, 30);
      const img = images[index];
      if (img) cover(g, img, 0, 44, 1000, 556);
      g.fillStyle = "rgba(10, 12, 20, 0.72)";
      g.fillRect(0, 528, 1000, 72);
      g.fillStyle = "#f4eee6";
      g.font = "700 34px Georgia, serif";
      g.textAlign = "left";
      g.fillText(s.title, 32, 576);
      texture.needsUpdate = true;
    };
    screens.forEach((s, i) =>
      loadImage(s.image)
        .then((img) => {
          images[i] = img;
          if (alive && i === index) paint();
        })
        .catch(() => {}),
    );
    paint();
    const timer = reduced
      ? 0
      : window.setInterval(() => {
          index = (index + 1) % screens.length;
          paint();
        }, 3200);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [canvas, texture, screens, reduced]);

  return texture;
}

function geometryFor(p: Part) {
  const [w, h, d] = p.dims;
  switch (p.prim) {
    case "cylinder":
      return <cylinderGeometry args={[w / 2, w / 2, h, 28]} />;
    case "cone":
      return <cylinderGeometry args={[w * 0.18, w / 2, h, 28, 1, true]} />;
    case "capsule":
      return <capsuleGeometry args={[w / 2, Math.max(0.001, h - w), 6, 14]} />;
    case "torus":
      return <torusGeometry args={[w * 0.45, w * 0.45 * (p.torus ?? 0.2), 12, 32]} />;
    default:
      return <boxGeometry args={[w, h, d]} />;
  }
}

type Handlers = {
  onPoster: () => void;
  onLamp: () => void;
  onMonitor: () => void;
};

function pointer(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "";
}

function RoomModel({ night, screens, reduced, handlers }: { night: React.RefObject<number>; screens: Screen[]; reduced: boolean; handlers: Handlers }) {
  const materials = useMemo(() => {
    const out: Record<string, THREE.MeshStandardMaterial> = {};
    for (const [id, m] of Object.entries(MATS)) {
      out[id] = new THREE.MeshStandardMaterial({
        color: m.color,
        roughness: Math.max(0.35, m.roughness),
        metalness: m.metalness,
        emissive: m.emissive ?? "#000000",
        emissiveIntensity: m.emissiveIntensity,
        transparent: id === "glass",
        opacity: id === "glass" ? 0.85 : 1,
        side: id === "lamp-glow" ? THREE.DoubleSide : THREE.FrontSide,
      });
    }
    return out;
  }, []);

  const screen = useScreenTexture(screens, reduced);
  const decals = useMemo(() => {
    const poster = canvasTexture(340, 460, (g) => {
      g.fillStyle = "#1e3a4a";
      g.fillRect(0, 0, 340, 460);
      g.fillStyle = "#f4eee6";
      g.font = "800 40px Georgia, serif";
      g.textAlign = "center";
      g.fillText("GENESIS", 170, 380);
      g.fillText("TOWN", 170, 424);
    });
    loadImage("/genesis-town.png")
      .then((img) => {
        const g = (poster.image as HTMLCanvasElement).getContext("2d")!;
        g.drawImage(img, 300, 90, 680, 620, 20, 24, 300, 300);
        poster.needsUpdate = true;
      })
      .catch(() => {});
    return {
      poster,
      plaque: canvasTexture(256, 64, (g) => {
        g.fillStyle = "#c98f5e";
        g.fillRect(0, 0, 256, 64);
        g.fillStyle = "#4a2c18";
        g.font = "800 44px Georgia, serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("KIYA", 128, 36);
      }),
      letters: [
        letterTexture("K", "#b8574a", "#f4eee6"),
        letterTexture("I", "#f4eee6", "#b8574a"),
        letterTexture("Y", "#8ba67e", "#f4eee6"),
        letterTexture("A", "#c98f5e", "#f4eee6"),
      ],
    };
  }, []);

  const hourHand = useRef<THREE.Group>(null);
  const minuteHand = useRef<THREE.Group>(null);
  const pressed = useRef<Record<string, number>>({});
  const keyMeshes = useRef<Record<string, THREE.Mesh | null>>({});

  useFrame((_, dt) => {
    const n = night.current;
    materials.bulb.emissiveIntensity = 0.35 + n * 2.6;
    materials["lamp-glow"].emissiveIntensity = 0.15 + n * 1.4;
    materials.glass.color.copy(SKY_DAY).lerp(SKY_NIGHT, n);
    materials.glass.emissive.copy(GLOW_DAY).lerp(GLOW_NIGHT, n);
    materials.glass.emissiveIntensity = 0.55 - n * 0.3;
    materials.screen.emissiveIntensity = 1;

    // Clock: the real time in Yogyakarta.
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const m = now.getMinutes() + now.getSeconds() / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (minuteHand.current) minuteHand.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hourHand.current) hourHand.current.rotation.z = -(h / 12) * Math.PI * 2;

    // Piano keys spring back after a press.
    for (const [id, t] of Object.entries(pressed.current)) {
      const left = Math.max(0, t - dt);
      pressed.current[id] = left;
      const mesh = keyMeshes.current[id];
      const base = PARTS.find((p) => p.id === id)!;
      if (mesh) mesh.position.y = base.pos[1] - (left > 0 ? 0.008 : 0);
      if (left === 0) delete pressed.current[id];
    }
  });

  const keyPress = (p: Part) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const i = Number(p.id.split("-")[1]);
    playNote(p.id.startsWith("w") ? WHITE_HZ[i] : BLACK_HZ[i]);
    pressed.current[p.id] = 0.18;
  };
  const hover = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      pointer(true);
    },
    onPointerOut: () => pointer(false),
  };

  return (
    <group>
      {PARTS.map((p) => {
        const [w, h, d] = p.dims;
        const key = p.id;

        if (p.id === "clock-hand-h" || p.id === "clock-hand-m") {
          const ref = p.id === "clock-hand-h" ? hourHand : minuteHand;
          return (
            <group key={key} ref={ref} position={[-0.42, 1.88, p.pos[2]]}>
              <mesh position={[0, h / 2 - 0.01, 0]} material={materials[p.mat]}>
                <boxGeometry args={[w, h, d]} />
              </mesh>
            </group>
          );
        }
        if (p.prim === "tube" && p.tube) {
          const curve = new THREE.CatmullRomCurve3(p.tube.points.map((v) => new THREE.Vector3(...v)));
          return (
            <mesh key={key} material={materials[p.mat]}>
              <tubeGeometry args={[curve, 64, p.tube.radius, 6, false]} />
            </mesh>
          );
        }
        if (p.id === "monitor-screen") {
          return (
            <mesh key={key} position={p.pos} onClick={(e) => { e.stopPropagation(); handlers.onMonitor(); }} {...hover}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial map={screen} emissive="#ffffff" emissiveMap={screen} emissiveIntensity={0.95} roughness={0.35} />
            </mesh>
          );
        }
        if (p.id === "poster") {
          return (
            <mesh key={key} position={[p.pos[0], p.pos[1], p.pos[2] + 0.004]} onClick={(e) => { e.stopPropagation(); handlers.onPoster(); }} {...hover}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial map={decals.poster} roughness={0.8} />
            </mesh>
          );
        }
        if (p.id === "poster-island") return null;
        if (p.id === "plaque") {
          return (
            <mesh key={key} position={p.pos} rotation={[0, -Math.PI / 2, 0]}>
              <boxGeometry args={[d, h, w]} />
              <meshStandardMaterial map={decals.plaque} roughness={0.6} />
            </mesh>
          );
        }
        if (p.id.startsWith("block-") || p.id === "jar") {
          const i = p.id === "jar" ? 3 : Number(p.id.split("-")[1]);
          const pos: [number, number, number] = p.id === "jar" ? [0.78, 1.785, -0.97] : p.pos;
          return (
            <RoundedBox key={key} args={[0.09, 0.09, 0.09]} radius={0.012} smoothness={3} position={pos} rotation={[0, (i - 1.5) * 0.08, 0]} castShadow>
              <meshStandardMaterial map={decals.letters[i]} roughness={0.5} />
            </RoundedBox>
          );
        }
        if (p.id.startsWith("wkey-") || p.id.startsWith("bkey-")) {
          return (
            <mesh
              key={key}
              ref={(m) => { keyMeshes.current[p.id] = m; }}
              position={p.pos}
              material={materials[p.mat]}
              onClick={keyPress(p)}
              {...hover}
            >
              <boxGeometry args={[w, h, d]} />
            </mesh>
          );
        }

        const lamp = p.id.startsWith("lamp-");
        const events = lamp ? { onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); handlers.onLamp(); }, ...hover } : {};
        const scale: [number, number, number] | undefined =
          p.prim === "sphere" || p.prim === "ellipsoid" ? [w, h, d] : undefined;

        if (p.prim === "box" && Math.min(w, h, d) >= 0.012) {
          const radius = Math.min(0.03, Math.min(w, h, d) * 0.22);
          return (
            <RoundedBox
              key={key}
              args={[w, h, d]}
              radius={radius}
              smoothness={2}
              position={p.pos}
              rotation={p.rot}
              material={materials[p.mat]}
              castShadow
              receiveShadow
              {...events}
            />
          );
        }
        return (
          <mesh key={key} position={p.pos} rotation={p.rot} scale={scale} material={materials[p.mat]} castShadow receiveShadow {...events}>
            {scale ? <sphereGeometry args={[0.5, 20, 14]} /> : geometryFor(p)}
          </mesh>
        );
      })}
    </group>
  );
}

function Lights({ night }: { night: React.RefObject<number> }) {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const strand = useRef<THREE.PointLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const monitor = useRef<THREE.PointLight>(null);
  const day = useMemo(() => ({ sky: new THREE.Color("#fff4e6"), ground: new THREE.Color("#c9a27e"), sun: new THREE.Color("#ffe2b8") }), []);
  const dark = useMemo(() => ({ sky: new THREE.Color("#3a4570"), ground: new THREE.Color("#1a1410"), sun: new THREE.Color("#9fb4ff") }), []);

  useFrame(() => {
    const n = night.current;
    if (hemi.current) {
      hemi.current.color.copy(day.sky).lerp(dark.sky, n);
      hemi.current.groundColor.copy(day.ground).lerp(dark.ground, n);
      hemi.current.intensity = 1.25 - n * 0.95;
    }
    if (key.current) {
      key.current.color.copy(day.sun).lerp(dark.sun, n);
      key.current.intensity = 2.4 - n * 2.0;
    }
    if (strand.current) strand.current.intensity = 0.15 + n * 1.8;
    if (lamp.current) lamp.current.intensity = 0.05 + n * 0.9;
    if (monitor.current) monitor.current.intensity = 0.25 + n * 0.7;
  });

  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={key}
        position={[4, 3.4, 0.6]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
      />
      <pointLight ref={strand} position={[-0.2, 1.55, -0.75]} color="#ffc978" distance={2.6} decay={1.6} />
      <pointLight ref={lamp} position={[0.3, 0.32, -0.45]} color="#ffb860" distance={1.6} decay={1.6} />
      <pointLight ref={monitor} position={[-0.28, 1.2, -0.7]} color="#9fb6ff" distance={1.4} decay={1.8} />
    </>
  );
}

function Director({ progress, frame, night, target, reduced }: { progress: React.RefObject<number>; frame: React.RefObject<Frame>; night: React.RefObject<number>; target: React.RefObject<number>; reduced: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const smooth = useRef(progress.current);
  const tilt = useRef({ x: 0, y: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      tilt.current.x = e.clientX / window.innerWidth - 0.5;
      tilt.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1) / TRANSITION_S;
    const diff = target.current - night.current;
    night.current = reduced || Math.abs(diff) <= step ? target.current : night.current + Math.sign(diff) * step;

    smooth.current += (progress.current - smooth.current) * (reduced ? 1 : 0.12);
    // Ease so the camera lingers on the whole room, then commits to the screen.
    const t = smooth.current < 0.5 ? 2 * smooth.current ** 2 : 1 - (-2 * smooth.current + 2) ** 2 / 2;

    // Fit the room's bounding sphere into the free part of the stage: pull back until it fits the
    // region's height and width, then shift the image so its centre sits on the region's centre.
    const { width: W, height: H } = size;
    const f = frame.current;
    const rw = Math.max(80, f.right - f.left), rh = Math.max(80, f.bottom - f.top);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const dist = Math.max(ROOM_RADIUS / (tanV * (rh / H)), ROOM_RADIUS / (tanV * (W / H) * (rw / W)));
    PATH.points[0].copy(ROOM_CENTER).addScaledVector(START_DIR, dist);

    PATH.getPoint(t, pos);
    LOOK.getPoint(t, look);

    const k = 1 - Math.min(1, t / 0.3);
    const shift = k * k * (3 - 2 * k);
    const dx = ((f.left + f.right) / 2 - W / 2) * shift;
    const dy = ((f.top + f.bottom) / 2 - H / 2) * shift;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) camera.setViewOffset(W, H, -dx, -dy, W, H);
    else if (camera.view?.enabled) camera.clearViewOffset();
    const sway = reduced ? 0 : (1 - t) * 0.35;
    pos.x += tilt.current.x * sway;
    pos.y -= tilt.current.y * sway * 0.5;
    camera.position.copy(pos);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ progress, frame, screens, reduced, handlers }: { progress: React.RefObject<number>; frame: React.RefObject<Frame>; screens: Screen[]; reduced: boolean; handlers: Handlers }) {
  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
  const night = useRef(isDark() ? 1 : 0);
  const target = useRef(night.current);
  const invalidate = useThree((s) => s.invalidate);

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
      <Director progress={progress} frame={frame} night={night} target={target} reduced={reduced} />
      <ContactShadows position={[0, -0.09, 0]} scale={6.5} blur={2.4} far={1.2} opacity={0.38} resolution={512} frames={1} color="#3a2414" />
      <Lights night={night} />
      <RoomModel night={night} screens={screens} reduced={reduced} handlers={handlers} />
    </>
  );
}

export default function RoomScene({
  progress,
  frame,
  screens,
  reduced,
  compact,
  handlers,
  onReady,
}: {
  progress: React.RefObject<number>;
  frame: React.RefObject<Frame>;
  screens: Screen[];
  reduced: boolean;
  compact: boolean;
  handlers: Handlers;
  onReady?: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useFrameloop(wrapper, reduced);
  const [dpr] = useState<[number, number]>(compact ? [1, 1.25] : [1, 1.75]);

  useEffect(() => () => pointer(false), []);

  return (
    <div ref={wrapper} className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={dpr}
        shadows={!compact}
        camera={{ position: [-2.3, 2.45, 4.3], fov: 38, near: 0.02, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => onReady?.()}
      >
        <Scene progress={progress} frame={frame} screens={screens} reduced={reduced} handlers={handlers} />
      </Canvas>
    </div>
  );
}
