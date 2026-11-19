"use client";

import { useSeasonal } from "@/components/providers/SeasonalProvider";
import { SantaSleigh } from "./SantaSleigh";
import { Snowfall } from "./Snowfall";

/** Page-wide holiday effects. Nothing renders outside the season or under reduced motion. */
export function SeasonalLayer() {
  const { mounted, festive, reducedMotion } = useSeasonal();
  if (!mounted || !festive || reducedMotion) return null;

  return (
    <>
      <div aria-hidden className="retro-scan" />
      <div aria-hidden className="retro-grain" />
      <Snowfall />
      <SantaSleigh />
    </>
  );
}
