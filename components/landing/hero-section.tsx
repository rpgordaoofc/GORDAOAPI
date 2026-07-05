"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const WORDS = ["LICENÇAS", "SEGURANÇA", "CONTROLE", "PERFORMANCE", "AUTOMAÇÃO"];

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.5 + 0.1,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,38,38,${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(220,38,38,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="relative inline-block">
      <span className={glitch ? "opacity-0" : ""}>{text}</span>
      {glitch && (
        <>
          <span className="absolute inset-0 text-red-400" style={{ clipPath: "inset(30% 0 40% 0)", transform: "translateX(-3px)" }}>{text}</span>
          <span className="absolute inset-0 text-cyan-400" style={{ clipPath: "inset(60% 0 10% 0)", transform: "translateX(3px)" }}>{text}</span>
        </>
      )}
    </span>
  );
}

function TypeWriter() {
  const [wordIdx, setWordIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState("");
  useEffect(() => {
    const word = WORDS[wordIdx];
    const speed = deleting ? 50 : 100;
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, char + 1));
        if (char + 1 === word.length) { setTimeout(() => setDeleting(true), 1500); }
        else setChar(c => c + 1);
      } else {
        setText(word.slice(0, char - 1));
        if (char - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % WORDS.length); setChar(0); }
        else setChar(c => c - 1);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [char, deleting, wordIdx]);
  return (
    <span className="text-red-500 font-black">
      {text}<span className="animate-pulse">|</span>
    </span>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] relative overflow-hidden flex flex-col" style={{ cursor: "none" }}>
      {/* Particles */}
      <ParticleCanvas />

      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)" }} />

      {/* Mouse follow glow */}
      <div ref={glowRef} className="pointer-events-none absolute z-[2]"
        style={{ width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)", filter: "blur(40px)", top: 0, left: 0, transition: "transform 0.08s ease-out", willChange: "transform" }} />

      {/* Top glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-[2]"
        style={{ width: 900, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(220,38,38,0.18) 0%, transparent 70%)", filter: "blur(60px)" }} />

      {/* Corner brackets */}
      {[["top-0 left-0 border-l-2 border-t-2", "0 0"], ["top-0 right-0 border-r-2 border-t-2", "0 0"], ["bottom-0 left-0 border-l-2 border-b-2", "0 0"], ["bottom-0 right-0 border-r-2 border-b-2", "0 0"]].map(([cls], i) => (
        <div key={i} className={`pointer-events-none absolute w-16 h-16 border-red-600/50 z-[3] ${cls.split(" ").slice(0, -1).join(" ")}`} />
      ))}

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
        {/* Barra lateral esquerda */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(180deg, transparent 0%, #dc2626 30%, #991b1b 70%, transparent 100%)", boxShadow: "0 0 12px rgba(220,38,38,0.6)" }} />
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0">
            <Image src="/RG.png" alt="RP GORDAO" fill className="object-contain" />
          </div>
          <div>
            <span className="text-white font-black tracking-widest uppercase text-sm">RP GORDAO</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400/70 font-mono uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {["Features", "Segurança", "API", "Status"].map(item => (
            <a key={item} href="#" className="text-white/30 hover:text-white/80 text-sm transition-colors hidden md:block">{item}</a>
          ))}
          <Link href="/dashboard"
            className="relative group bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-6 py-2.5 rounded transition-all overflow-hidden"
            style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}>
            <span className="relative z-10">Acessar Painel</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className={`mb-8 inline-flex items-center gap-3 border border-red-600/30 bg-red-600/5 rounded-full px-5 py-2 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <span className="h-2 w-2 rounded-full bg-red-500" style={{ boxShadow: "0 0 8px #dc2626", animation: "pulse 1.5s infinite" }} />
          <span className="text-xs text-red-400 font-mono tracking-[0.2em] uppercase">Sistema Online · RP GORDAO API</span>
          <span className="h-2 w-2 rounded-full bg-red-500" style={{ boxShadow: "0 0 8px #dc2626", animation: "pulse 1.5s infinite" }} />
        </div>

        {/* Main headline */}
        <h1 className={`text-6xl sm:text-8xl lg:text-[7rem] font-black tracking-tighter text-white leading-[0.9] mb-6 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ textShadow: "0 0 80px rgba(220,38,38,0.2)" }}>
          <GlitchText text="RP" />
          <br />
          <span className="text-red-600" style={{ textShadow: "0 0 40px rgba(220,38,38,0.6), 0 0 80px rgba(220,38,38,0.3)" }}>
            <GlitchText text="GORDAO" />
          </span>
        </h1>

        {/* Typewriter */}
        <div className={`text-2xl sm:text-3xl font-bold mb-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <span className="text-white/30">Gestão de </span><TypeWriter />
        </div>

        {/* Subtitle */}
        <p className={`text-white/40 text-base max-w-lg mb-10 leading-relaxed transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          Painel administrativo completo para gerenciar licenças, keys, usuários e produtos. Total controle em tempo real.
        </p>

        {/* CTAs */}
        <div className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href="/dashboard"
            className="group relative bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded text-sm tracking-wider uppercase transition-all overflow-hidden"
            style={{ boxShadow: "0 0 30px rgba(220,38,38,0.4), 0 0 60px rgba(220,38,38,0.15)" }}>
            <span className="relative z-10 flex items-center gap-2">Acessar Dashboard <span className="group-hover:translate-x-1 transition-transform inline-block">→</span></span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>

        {/* Tags */}
        <div className={`flex flex-wrap justify-center gap-2 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {["LICENÇAS", "KEYS", "HWID LOCK", "PAINEL ADMIN", "WEBHOOKS", "PRODUTOS", "BLACKLIST", "CUPONS", "BUSCA GLOBAL"].map((tag, i) => (
            <span key={tag} className="border border-white/[0.06] bg-white/[0.02] hover:border-red-600/30 hover:bg-red-600/5 text-white/25 hover:text-white/60 text-xs font-mono px-3 py-1 rounded tracking-widest transition-all cursor-default"
              style={{ animationDelay: `${i * 0.05}s` }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 border-t border-white/[0.04] px-8 py-5">
        <div className="flex justify-center gap-8 sm:gap-16">
          {[{ label: "UPTIME", value: "99.9%" }, { label: "LATÊNCIA", value: "<50ms" }, { label: "KEYS", value: "10K+" }, { label: "REQ/DIA", value: "1M+" }].map(s => (
            <div key={s.label} className="text-center group">
              <p className="text-white font-black text-xl group-hover:text-red-400 transition-colors">{s.value}</p>
              <p className="text-white/20 text-[10px] font-mono tracking-[0.2em]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
