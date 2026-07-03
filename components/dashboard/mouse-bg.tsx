"use client";

import { useEffect, useRef } from "react";

export function MouseBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Static dark gradient background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #111111 40%, #130a0a 70%, #0d0d0d 100%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Mouse follow glow */}
      <div
        ref={glowRef}
        className="fixed z-0 pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, rgba(220,38,38,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
          transition: "transform 0.15s ease-out",
          top: 0,
          left: 0,
          willChange: "transform",
        }}
      />

      {/* Corner glow top-right */}
      <div
        className="fixed top-0 right-0 z-0 pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 60%)",
          filter: "blur(60px)",
          transform: "translate(30%, -30%)",
        }}
      />
    </>
  );
}
