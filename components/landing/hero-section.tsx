"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const iv = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(iv);
  }, []);

  const tags = ["LICENÇAS", "KEYS", "HWID LOCK", "PAINEL ADMIN", "WEBHOOKS", "PRODUTOS"];

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden flex flex-col">
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
        }}
      />

      {/* Red glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-red-700/20 blur-[120px] pointer-events-none" />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-red-600/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-red-600/40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-red-600/40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-red-600/40 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-black text-xs">RG</span>
          </div>
          <span className="text-white font-bold tracking-widest uppercase text-sm">
            RP GORDAO
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-white/40 hover:text-white/80 text-sm transition-colors">
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
          >
            Acessar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Status bar */}
        <div
          className={`mb-8 inline-flex items-center gap-2 border border-red-600/30 bg-red-600/5 rounded px-4 py-1.5 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400 font-mono tracking-widest uppercase">
            Sistema Online — RP GORDAO API
          </span>
        </div>

        {/* Main title */}
        <h1
          className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none mb-6 transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          RP
          <br />
          <span className="text-red-600">GORDAO</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-white/40 text-lg max-w-xl mb-10 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Gerencie licenças, keys e usuários com total controle.
          <br />
          Painel administrativo exclusivo.
        </p>

        {/* CTA */}
        <div
          className={`flex gap-4 mb-16 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link
            href="/dashboard"
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded text-sm tracking-wider uppercase transition-all shadow-lg shadow-red-600/20"
          >
            Acessar Painel →
          </Link>
        </div>

        {/* Tags */}
        <div
          className={`flex flex-wrap justify-center gap-2 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="border border-white/[0.08] bg-white/[0.02] text-white/30 text-xs font-mono px-3 py-1 rounded tracking-widest"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="relative z-10 border-t border-white/[0.04] px-8 py-4">
        <div className="flex justify-center gap-12">
          {[
            { label: "UPTIME", value: "99.9%" },
            { label: "LATÊNCIA", value: "<50ms" },
            { label: "KEYS", value: "10K+" },
            { label: "REQ/DIA", value: "1M+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/20 text-xs font-mono tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
