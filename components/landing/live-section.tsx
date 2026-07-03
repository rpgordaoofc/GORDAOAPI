"use client";

import { useEffect, useState, useCallback } from "react";

interface LiveData {
  keys: number; users: number; products: number; activeKeys: number;
  pendingKeys: number; bannedKeys: number; pausedKeys: number; expiredKeys: number;
}

function PulsingDot({ color = "#dc2626" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

function AnimatedNumber({ value, prev }: { value: number; prev: number }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
    setDisplay(value);
  }, [value, prev]);

  return (
    <span className={`font-black tabular-nums transition-all duration-300 ${flash ? "text-red-400 scale-110" : ""}`}>
      {display.toLocaleString("pt-BR")}
    </span>
  );
}

// Mini sparkline bar chart
function MiniBar({ values }: { values: number[] }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-6 mt-2">
      {values.slice(-12).map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-300"
          style={{ height: `${Math.max(10, (v / max) * 100)}%`, background: i === values.slice(-12).length - 1 ? "#dc2626" : "rgba(220,38,38,0.25)" }} />
      ))}
    </div>
  );
}

export function LiveSection() {
  const [data, setData] = useState<LiveData | null>(null);
  const [prev, setPrev] = useState<LiveData | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const API = "https://gordao0ofc.discloud.app";

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${API}/v1/admin/overview`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        setPrev(data);
        const d: LiveData = {
          keys: json.data.keys ?? 0, users: json.data.users ?? 0,
          products: json.data.products ?? 0, activeKeys: json.data.activeKeys ?? 0,
          pendingKeys: json.data.pendingKeys ?? 0, bannedKeys: json.data.bannedKeys ?? 0,
          pausedKeys: json.data.pausedKeys ?? 0, expiredKeys: json.data.expiredKeys ?? 0,
        };
        setData(d);
        setHistory(h => [...h.slice(-24), d.activeKeys]);
        setLastUpdate(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        setLoading(false);
      }
    } catch { setLoading(false); }
  }, [data]);

  useEffect(() => {
    void fetch_();
    const iv = setInterval(fetch_, 10_000);
    return () => clearInterval(iv);
  }, []);

  const metrics = data ? [
    { label: "Total Keys",    value: data.keys,        color: "#fff",     icon: "🔑" },
    { label: "Ativas",        value: data.activeKeys,  color: "#22c55e",  icon: "✅" },
    { label: "Usuarios",      value: data.users,       color: "#60a5fa",  icon: "👤" },
    { label: "Produtos",      value: data.products,    color: "#f59e0b",  icon: "📦" },
    { label: "Pendentes",     value: data.pendingKeys, color: "#a78bfa",  icon: "⏳" },
    { label: "Banidas",       value: data.bannedKeys,  color: "#dc2626",  icon: "🚫" },
    { label: "Pausadas",      value: data.pausedKeys,  color: "#fb923c",  icon: "⏸" },
    { label: "Expiradas",     value: data.expiredKeys, color: "#6b7280",  icon: "💀" },
  ] : [];

  return (
    <section className="relative bg-[#060606] py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PulsingDot />
              <span className="text-xs font-mono text-red-400/80 tracking-[0.2em] uppercase">Dados em Tempo Real</span>
            </div>
            <h2 className="text-3xl font-black text-white">
              Sistema <span className="text-red-600">Ao Vivo</span>
            </h2>
          </div>
          {lastUpdate && (
            <div className="text-right">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Última atualização</p>
              <p className="text-sm font-mono text-white/50 mt-0.5">{lastUpdate}</p>
              <p className="text-[10px] font-mono text-white/20 mt-0.5">Auto-refresh: 10s</p>
            </div>
          )}
        </div>

        {/* Metrics grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/[0.02] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="group relative rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all overflow-hidden">
                {/* Corner glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(circle at 0% 0%, ${m.color}08, transparent 60%)` }} />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{m.icon}</span>
                  <div className="h-1 w-1 rounded-full" style={{ background: m.color, boxShadow: `0 0 4px ${m.color}` }} />
                </div>
                <div className="text-3xl" style={{ color: m.color }}>
                  <AnimatedNumber value={m.value} prev={prev ? (prev as any)[Object.keys(prev).find(k => (prev as any)[k] === m.value) || ""] : m.value} />
                </div>
                <p className="text-[11px] text-white/30 font-mono uppercase tracking-widest mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sparkline card */}
        {history.length > 1 && (
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Keys Ativas — histórico</p>
              <span className="text-sm font-black text-green-400">{data?.activeKeys.toLocaleString("pt-BR")}</span>
            </div>
            <MiniBar values={history} />
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-center text-white/15 text-[10px] font-mono mt-6 tracking-[0.15em] uppercase">
          Dados reais · API RP GORDAO · gordao0ofc.discloud.app
        </p>
      </div>
    </section>
  );
}
