"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { safeSet } from "@/lib/storage";

export type MusicState = "off" | "playing" | "muted";

type SeasonalContextValue = {
  /** False until mounted, so server and first client render match. */
  mounted: boolean;
  festive: boolean;
  setFestive: (on: boolean) => void;
  reducedMotion: boolean;
  music: MusicState;
  musicError: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  /** 0..1 loudness of the track, updated every frame while it plays. */
  levelRef: RefObject<number>;
};

const SeasonalContext = createContext<SeasonalContextValue>({
  mounted: false,
  festive: false,
  setFestive: () => {},
  reducedMotion: true,
  music: "off",
  musicError: false,
  togglePlay: () => {},
  toggleMute: () => {},
  levelRef: { current: 0 },
});

export const SEASON_KEY = "kiya.dev:season";
const AUDIO_SRC = "/audio/christmas.mp3";

export function SeasonalProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [festive, setFestiveState] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRef = useRef(0);

  // The pre-paint script in layout.tsx already picked the season; read its result.
  useEffect(() => {
    setFestiveState(document.documentElement.dataset.season === "christmas");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    setMounted(true);
    return () => mq.removeEventListener("change", update);
  }, []);

  const releaseAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const setFestive = useCallback(
    (on: boolean) => {
      setFestiveState(on);
      if (on) {
        document.documentElement.dataset.season = "christmas";
      } else {
        delete document.documentElement.dataset.season;
        releaseAudio();
      }
      safeSet(SEASON_KEY, on ? "on" : "off");
    },
    [releaseAudio],
  );

  const togglePlay = useCallback(() => {
    let audio = audioRef.current;
    if (!audio) {
      // Created on the first click only, never on mount.
      audio = new Audio(AUDIO_SRC);
      audio.loop = true;
      audio.volume = 0.35;
      audio.addEventListener("play", () => setPlaying(true));
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("error", () => {
        setPlaying(false);
        setMusicError(true);
      });
      audioRef.current = audio;

      try {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaElementSource(audio).connect(analyser);
        analyser.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
      } catch {
        // No Web Audio: music still plays, lights just don't react.
      }
    }
    if (audio.paused) {
      setMusicError(false);
      void ctxRef.current?.resume();
      audio.play().catch(() => {
        setPlaying(false);
        setMusicError(true);
      });
    } else {
      audio.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  useEffect(() => {
    const analyser = analyserRef.current;
    if (!playing || muted || !analyser) {
      levelRef.current = 0;
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      // Low end carries the beat; average the first quarter of the bins.
      let sum = 0;
      const n = data.length >> 2;
      for (let i = 0; i < n; i++) sum += data[i];
      const target = sum / n / 255;
      levelRef.current += (target - levelRef.current) * 0.25;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, muted]);

  // Pause when the tab is hidden. No auto-resume: only a click starts the music.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") audioRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      void ctxRef.current?.close();
    },
    [],
  );

  const music: MusicState = !playing ? "off" : muted ? "muted" : "playing";

  return (
    <SeasonalContext.Provider
      value={{
        mounted,
        festive,
        setFestive,
        reducedMotion,
        music,
        musicError,
        togglePlay,
        toggleMute,
        levelRef,
      }}
    >
      {children}
    </SeasonalContext.Provider>
  );
}

export function useSeasonal() {
  return useContext(SeasonalContext);
}
