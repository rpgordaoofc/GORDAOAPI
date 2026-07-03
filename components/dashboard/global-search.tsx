"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, KeyIcon, UsersIcon, CubeIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "motion/react";

interface SearchResult { id: string; label: string; sub?: string; type: "key"|"user"|"product"|"admin"; href: string; }

const TYPE_ICONS = { key: KeyIcon, user: UsersIcon, product: CubeIcon, admin: ShieldCheckIcon };
const TYPE_COLORS = { key: "#dc2626", user: "#60a5fa", product: "#34d399", admin: "#f59e0b" };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open with Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(v => !v); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api-proxy/v1/admin/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      if (!data.success) return;
      const r: SearchResult[] = [];
      data.data?.keys?.forEach((k: any) => r.push({ id: k.id, label: k.code, sub: k.usedBy ? `Discord: ${k.usedBy}` : "Sem vinculo", type: "key", href: `/dashboard/keys?key=${k.code}` }));
      data.data?.users?.forEach((u: any) => r.push({ id: u.id, label: u.username || u.id, sub: `Discord ID: ${u.id}`, type: "user", href: `/dashboard/users` }));
      data.data?.products?.forEach((p: any) => r.push({ id: p.id, label: p.name, sub: "Produto", type: "product", href: `/dashboard/products` }));
      data.data?.admins?.forEach((a: any) => r.push({ id: a.id, label: a.displayName || a.username, sub: `${a.role} · @${a.username}`, type: "admin", href: `/dashboard/admin-users` }));
      setResults(r);
      setSelected(0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) { router.push(results[selected].href); setOpen(false); setQuery(""); }
  };

  const go = (href: string) => { router.push(href); setOpen(false); setQuery(""); };

  return (
    <>
      {/* Trigger button in header area */}
      <button onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.05] transition-colors">
        <MagnifyingGlassIcon className="h-3.5 w-3.5" />
        Buscar...
        <kbd className="ml-2 rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-mono">Ctrl+K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -10 }} transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
                  placeholder="Buscar keys, usuarios, produtos, admins..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground/40 outline-none" />
                {loading && <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-primary animate-spin shrink-0" />}
                <button onClick={() => setOpen(false)} className="text-muted-foreground/40 hover:text-foreground"><XMarkIcon className="h-4 w-4" /></button>
              </div>

              {results.length === 0 && query.length >= 2 && !loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground/40">Nenhum resultado para &ldquo;{query}&rdquo;</div>
              ) : results.length === 0 && query.length < 2 ? (
                <div className="p-6 text-center text-xs text-muted-foreground/30">Digite pelo menos 2 caracteres</div>
              ) : (
                <div className="max-h-80 overflow-y-auto py-2">
                  {results.map((r, i) => {
                    const Icon = TYPE_ICONS[r.type];
                    return (
                      <button key={r.id + i} onClick={() => go(r.href)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selected ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}`}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${TYPE_COLORS[r.type]}18` }}>
                          <Icon className="h-4 w-4" style={{ color: TYPE_COLORS[r.type] }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.label}</p>
                          {r.sub && <p className="text-xs text-muted-foreground/50 truncate">{r.sub}</p>}
                        </div>
                        <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest shrink-0">{r.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-white/5 px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/30">
                <span><kbd className="font-mono">↑↓</kbd> navegar</span>
                <span><kbd className="font-mono">Enter</kbd> abrir</span>
                <span><kbd className="font-mono">Esc</kbd> fechar</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
