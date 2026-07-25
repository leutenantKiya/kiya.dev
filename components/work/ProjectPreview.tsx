"use client";

import { useState, useEffect } from "react";

export function ProjectPreview({
  preview,
  previews,
  alt,
  className = "",
  isHovered: externalHovered,
}: {
  preview?: string | string[] | null;
  previews?: string[];
  alt: string;
  className?: string;
  isHovered?: boolean;
}) {
  const images =
    Array.isArray(previews) && previews.length > 0
      ? previews
      : Array.isArray(preview) && preview.length > 0
      ? preview
      : typeof preview === "string" && preview
      ? [preview]
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalHovered, setInternalHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }
  }, []);

  const activeHover = externalHovered !== undefined ? externalHovered : internalHovered;
  const shouldSlide = activeHover || isTouchDevice;

  useEffect(() => {
    if (!shouldSlide || images.length <= 1) {
      if (!isTouchDevice) setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, isTouchDevice ? 2000 : 1200);

    return () => clearInterval(interval);
  }, [shouldSlide, isTouchDevice, images.length]);

  if (images.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => {
        setInternalHovered(false);
        if (!isTouchDevice) setCurrentIndex(0);
      }}
    >
      {images.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-opacity duration-500 ${
            idx === currentIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        />
      ))}

      {images.length > 1 && shouldSlide && (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-3 bg-accent" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
