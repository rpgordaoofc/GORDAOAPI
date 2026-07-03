"use client";

import { useEffect, useRef, useState } from "react";

interface Stat { value: number; label: string; suffix: string; color: string; desc: string; }

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const step = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="tabular-nums">{count.toLocaleString("pt-BR")}{suffix}</div>;
}

const STATS: Stat[] = [
  { value: 99, suffix: ".9%", label: "Uptime", color: "#22c55e", desc: "Disponibilidade garantida" },
  { value: 50, suffix: "ms", label: "Latência Média", color: "#dc2626", desc: "Resposta ultra-rápida" },
  { value: 10000, suffix: "+", label: "Keys Gerenciadas", color: "#f59e0b", desc: "Licenças ativas" },
  { value: 1000000, suffix: "+", label: "Requests/Dia", color: "#60a5fa", desc: "Capacidade de escala" },
];

// Decorative red circuit lines
function CircuitLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      <line x1="0" y1="100" x2="300" y2="100" stroke="#dc2626" strokeWidth="1"/>
      <line x1="300" y1="100" x2="300" y2="200" stroke="#dc2626" strokeWidth="1"/>
      <line x1="300" y1="200" x2="600" y2="200" stroke="#dc2626" strokeWidth="1"/>
      <circle cx="300" cy="100" r="3" fill="#dc2626"/>
      <circle cx="300" cy="200" r="3" fill="#dc2626"/>
      <line x1="900" y1="50" x2="900" y2="350" stroke="#dc2626" strokeWidth="1"/>
      <line x1="900" y1="200" x2="1200" y2="200" stroke="#dc2626" strokeWidth="1"/>
      <circle cx="900" cy="200" r="3" fill="#dc2626"/>
      <line x1="600" y1="0" x2="600" y2="400" stroke="#dc2626" strokeWidth="0.5"/>
    </svg>
  );
}

export function StatsSection() {
  return (
    <section className="relative bg-[#060606] py-24 overflow-hidden">
      {/* Red line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      <CircuitLines />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section label */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-600/30" />
          <span className="text-[10px] font-mono text-red-500/70 tracking-[0.3em] uppercase">Infraestrutura</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-600/30" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
          {STATS.map((s, i) => (
            <div key={s.label} className="relative bg-[#060606] p-8 group hover:bg-[#0a0a0a] transition-colors">
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l border-t opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: s.color }} />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: s.color }} />

              {/* Value */}
              <div className="text-4xl lg:text-5xl font-black mb-2 transition-all" style={{ color: s.color, textShadow: `0 0 20px ${s.color}40` }}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>

              {/* Label */}
              <p className="text-white font-bold text-sm mb-1">{s.label}</p>
              <p className="text-white/30 text-xs font-mono">{s.desc}</p>

              {/* Animated bar */}
              <div className="mt-4 h-[2px] bg-white/5 rounded overflow-hidden">
                <div className="h-full rounded transition-all duration-1000 delay-500 group-hover:w-full w-0" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/20 text-xs font-mono mt-8 tracking-widest">
          DADOS ATUALIZADOS EM TEMPO REAL · RP GORDAO API
        </p>
      </div>
    </section>
  );
}
