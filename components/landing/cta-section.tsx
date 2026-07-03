"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function CtaSection() {
  const [hovering, setHovering] = useState(false);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section className="relative bg-[#060606] py-32 overflow-hidden">
      {/* Background: diagonal red lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(220,38,38,0.015) 40px, rgba(220,38,38,0.015) 41px)",
      }} />

      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Red horizontal rule */}
        <div className="w-12 h-[3px] bg-red-600 mx-auto mb-8" style={{ boxShadow: "0 0 12px rgba(220,38,38,0.8)" }} />

        <h2 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
          Comece a usar
          <br />
          <span className="text-red-600" style={{ textShadow: "0 0 40px rgba(220,38,38,0.5)" }}>agora mesmo.</span>
        </h2>

        <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto">
          Acesse o painel administrativo e tenha controle total sobre suas licenças, usuários e produtos em tempo real.
        </p>

        {/* Magnetic button */}
        <Link href="/dashboard" ref={btnRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={handleMouseMove}
          className="relative inline-flex items-center gap-3 bg-red-600 text-white font-black text-lg px-12 py-5 rounded overflow-hidden group"
          style={{ boxShadow: hovering ? "0 0 50px rgba(220,38,38,0.5), 0 0 100px rgba(220,38,38,0.2)" : "0 0 20px rgba(220,38,38,0.2)" }}>
          {/* Magnetic light effect */}
          {hovering && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(circle 80px at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.15), transparent)`,
            }} />
          )}
          <span className="relative z-10">Acessar Painel</span>
          <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Meta info */}
        <div className="mt-10 flex items-center justify-center gap-8 text-xs font-mono text-white/20 tracking-[0.15em]">
          <span>SEM CADASTRO</span>
          <span className="text-white/10">·</span>
          <span>ACESSO IMEDIATO</span>
          <span className="text-white/10">·</span>
          <span>RP GORDAO API</span>
        </div>
      </div>
    </section>
  );
}
