"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "motion/react";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function AutoLock() {
  const { logout } = useAuth();
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLocked(true), TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ["mousemove","keydown","click","scroll","touchstart"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tryUnlock = () => {
    // Simple PIN stored in sessionStorage (set at login time)
    const stored = sessionStorage.getItem("unlock_pin");
    if (!stored || pin === stored) { setLocked(false); setPin(""); setError(false); reset(); }
    else { setError(true); setPin(""); setTimeout(() => setError(false), 2000); }
  };

  if (!locked) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
          className="w-full max-w-sm mx-4 rounded-2xl border border-white/10 bg-[#0f0f0f] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LockClosedIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-1">Sessao Bloqueada</h2>
          <p className="text-sm text-muted-foreground mb-6">Dashboard bloqueado por inatividade</p>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryUnlock()}
            placeholder="PIN de desbloqueio"
            className={`w-full rounded-xl border px-4 py-3 text-center text-sm bg-white/[0.04] text-foreground placeholder-muted-foreground/40 outline-none transition-colors ${error ? "border-red-500/50 bg-red-500/5" : "border-white/8 focus:border-primary/40"}`} />
          {error && <p className="text-xs text-red-400 mt-2 animate-shake">PIN incorreto</p>}
          <button onClick={tryUnlock} className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">Desbloquear</button>
          <button onClick={() => void logout()} className="mt-3 w-full text-xs text-muted-foreground/50 hover:text-foreground transition-colors">Sair da conta</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
