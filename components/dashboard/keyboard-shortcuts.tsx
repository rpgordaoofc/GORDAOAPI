"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const SHORTCUTS = [
  { keys: ["G", "O"], label: "Overview / Dashboard", href: "/dashboard" },
  { keys: ["G", "K"], label: "Licencas (Keys)", href: "/dashboard/keys" },
  { keys: ["G", "U"], label: "Usuarios", href: "/dashboard/users" },
  { keys: ["G", "P"], label: "Produtos", href: "/dashboard/products" },
  { keys: ["G", "L"], label: "Logs", href: "/dashboard/logs" },
  { keys: ["G", "S"], label: "Configuracoes", href: "/dashboard/settings" },
  { keys: ["G", "B"], label: "Bulk Actions", href: "/dashboard/bulk-actions" },
  { keys: ["G", "X"], label: "Blacklist", href: "/dashboard/blacklist" },
  { keys: ["G", "C"], label: "Cupons", href: "/dashboard/coupons" },
  { keys: ["?"], label: "Mostrar atalhos", href: null },
  { keys: ["Ctrl", "K"], label: "Busca global", href: null },
];

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let pendingKey: string | null = null;
    let timer: NodeJS.Timeout;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) { setShowHelp(v => !v); return; }
      if (e.key === "Escape") { setShowHelp(false); return; }

      if (e.key === "G" && !e.ctrlKey && !e.metaKey) {
        pendingKey = "G"; setPending("G");
        timer = setTimeout(() => { pendingKey = null; setPending(null); }, 1500);
        return;
      }

      if (pendingKey === "G") {
        clearTimeout(timer);
        const map: Record<string, string> = { O: "/dashboard", K: "/dashboard/keys", U: "/dashboard/users", P: "/dashboard/products", L: "/dashboard/logs", S: "/dashboard/settings", B: "/dashboard/bulk-actions", X: "/dashboard/blacklist", C: "/dashboard/coupons" };
        if (map[e.key.toUpperCase()]) { router.push(map[e.key.toUpperCase()]); }
        pendingKey = null; setPending(null);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <>
      {pending && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-white/10 bg-[#111] px-4 py-2 text-sm text-muted-foreground">
          <kbd className="font-mono font-bold text-foreground">G</kbd> + <span className="text-muted-foreground/60">pressione a tecla de destino...</span>
        </motion.div>
      )}

      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Atalhos de Teclado</h3>
                <button onClick={() => setShowHelp(false)} className="text-muted-foreground/40 hover:text-foreground"><XMarkIcon className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2">
                {SHORTCUTS.map(s => (
                  <div key={s.keys.join("+")} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-muted-foreground">{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-muted-foreground/30 text-xs">+</span>}
                          <kbd className="rounded bg-white/8 px-2 py-0.5 font-mono text-xs text-foreground">{k}</kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground/40 text-center">Pressione <kbd className="font-mono">?</kbd> para abrir/fechar</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
