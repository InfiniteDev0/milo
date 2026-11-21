"use client";

// Aceternity's shooting stars, in JS. Milo: the next star's timer is cleared on unmount, and the gradient id is
// unique, so two of these on one page don't share a trail.

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3:
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

export function ShootingStars({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) {
  const [star, setStar] = useState(null);
  const gradient = useId();

  useEffect(() => {
    let timer;
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      setStar({
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      });
      timer = setTimeout(createStar, Math.random() * (maxDelay - minDelay) + minDelay);
    };
    // the first star waits a frame, so the effect itself sets no state
    timer = setTimeout(createStar, 0);
    return () => clearTimeout(timer);
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    if (!star) return;
    const frame = requestAnimationFrame(() => {
      setStar((prev) => {
        if (!prev) return null;
        const x = prev.x + prev.speed * Math.cos((prev.angle * Math.PI) / 180);
        const y = prev.y + prev.speed * Math.sin((prev.angle * Math.PI) / 180);
        const distance = prev.distance + prev.speed;
        if (x < -20 || x > window.innerWidth + 20 || y < -20 || y > window.innerHeight + 20) return null;
        return { ...prev, x, y, distance, scale: 1 + distance / 100 };
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [star]);

  return (
    <svg className={cn("w-full h-full absolute inset-0", className)}>
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill={`url(#${gradient})`}
          transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2}, ${star.y + starHeight / 2})`}
        />
      )}
      <defs>
        <linearGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
