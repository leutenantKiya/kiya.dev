"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.29, 0.87, 0.5],
      glowColor: [0.1, 0.1, 0.12],
      markers: [
        { location: [-6.2088, 106.8456], size: 0.08 }, // Jakarta, Indonesia
        { location: [37.7749, -122.4194], size: 0.05 }, // San Francisco
        { location: [51.5074, -0.1278], size: 0.05 }, // London
        { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
      ],
      onRender: (state: Record<string, unknown>) => {
        state.phi = phi;
        phi += 0.005;
      },
    } as Parameters<typeof createGlobe>[1]);

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div
      className={cn(
        "mx-auto flex aspect-square w-full max-w-[600px] items-center justify-center relative overflow-hidden",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
        className="h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
      />
    </div>
  );
}
