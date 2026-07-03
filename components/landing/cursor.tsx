"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);
  const posRef = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const TRAIL_COUNT = 8;
    const trail = Array.from({ length: TRAIL_COUNT }, (_, i) => {
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed;pointer-events:none;z-index:9998;border-radius:50%;
        width:${6 - i * 0.4}px;height:${6 - i * 0.4}px;
        background:rgba(220,38,38,${0.6 - i * 0.07});
        transition:transform 0.05s ease;
      `;
      document.body.appendChild(el);
      return el;
    });
    trailRef.current = trail;

    const trailPositions = Array(TRAIL_COUNT).fill({ x: 0, y: 0 }).map(() => ({ x: 0, y: 0 }));

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    let raf: number;
    const animate = () => {
      // Ring follows with lag
      ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }

      // Trail follows
      trailPositions[0] = { ...posRef.current };
      for (let i = 1; i < TRAIL_COUNT; i++) {
        trailPositions[i] = {
          x: trailPositions[i].x + (trailPositions[i - 1].x - trailPositions[i].x) * 0.4,
          y: trailPositions[i].y + (trailPositions[i - 1].y - trailPositions[i].y) * 0.4,
        };
        const sz = 6 - i * 0.4;
        trail[i].style.transform = `translate(${trailPositions[i].x - sz / 2}px, ${trailPositions[i].y - sz / 2}px)`;
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    // Hover effects
    const handleEnter = () => {
      if (ringRef.current) { ringRef.current.style.transform += " scale(1.8)"; ringRef.current.style.borderColor = "rgba(220,38,38,0.9)"; }
    };
    const handleLeave = () => {
      if (ringRef.current) { ringRef.current.style.borderColor = "rgba(220,38,38,0.5)"; }
    };

    document.querySelectorAll("a,button,[role=button]").forEach(el => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      trail.forEach(el => el.remove());
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div ref={dotRef} style={{
        position: "fixed", zIndex: 9999, pointerEvents: "none", borderRadius: "50%",
        width: 8, height: 8, background: "#dc2626",
        boxShadow: "0 0 8px rgba(220,38,38,0.8)",
        top: 0, left: 0,
      }} />
      {/* Ring */}
      <div ref={ringRef} style={{
        position: "fixed", zIndex: 9998, pointerEvents: "none", borderRadius: "50%",
        width: 40, height: 40, border: "1.5px solid rgba(220,38,38,0.5)",
        top: 0, left: 0, transition: "border-color 0.2s",
      }} />
    </>
  );
}
