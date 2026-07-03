"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import { useSidebar } from "../layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { NoSymbolIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, ArrowPathIcon, ShieldExclamationIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "motion/react";
import { apiRequest } from "@/lib/api-internal";

interface BlacklistEntry { _id: string; discordId: string; reason: string | null; addedBy: string | null; createdAt: string; }

export default function BlacklistPage() {
  const { toggle } = useSidebar();
  const { addToast } = useToast();
  const [items, setItems] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [newId, setNewId] = useState("");
  const [newReason, setNewReason] = useState("");
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api-proxy/v1/admin/blacklist${search ? `?q=${encodeURIComponent(search)}` : ""}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) { setItems(data.data?.items ?? []); setTotal(data.data?.total ?? 0); }
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!newId.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api-proxy/v1/admin/blacklist", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ discordId: newId.trim(), reason: newReason.trim() || null }) });
      const data = await res.json();
      if (data.success) { addToast({ title: "Adicionado!", description: `${newId} na blacklist`, variant: "success" }); setNewId(""); setNewReason(""); void load(); }
      else addToast({ title: "Erro", description: data.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const remove = async (discordId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api-proxy/v1/admin/blacklist/${discordId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) { addToast({ title: "Removido!", description: `${discordId} removido da blacklist`, variant: "success" }); void load(); }
      else addToast({ title: "Erro", description: data.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen">
      <Header title="Blacklist" description="Discord IDs banidos permanentemente" onMenuClick={toggle} />
      <main className="p-4 lg:p-6 space-y-4">
        {/* Add form */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4"><NoSymbolIcon className="h-4 w-4 text-red-400" />Adicionar a Blacklist</h3>
          <div className="flex gap-2 flex-wrap">
            <Input value={newId} onChange={e => setNewId(e.target.value)} placeholder="Discord ID (ex: 123456789012345678)" className="bg-white/[0.03] border-white/8 h-9 text-sm flex-1 min-w-[200px]" />
            <Input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Motivo (opcional)" className="bg-white/[0.03] border-white/8 h-9 text-sm flex-1 min-w-[150px]" />
            <Button onClick={add} disabled={saving || !newId.trim()} className="bg-red-600 hover:bg-red-700 h-9 gap-2">
              <PlusIcon className="h-4 w-4" />Adicionar
            </Button>
          </div>
        </motion.div>

        {/* Search + list */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por Discord ID..." className="pl-9 bg-white/[0.03] border-white/8 h-9 text-sm" />
            </div>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="h-9 w-9 p-0 border border-white/8 bg-white/[0.02]">
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap">{total} registros</span>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-white/[0.02] animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
              <ShieldExclamationIcon className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Blacklist vazia</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div key={item._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                    <div className="h-8 w-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                      <NoSymbolIcon className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-semibold">{item.discordId}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                        {item.reason && <span>· {item.reason}</span>}
                        {item.addedBy && <span>· por {item.addedBy}</span>}
                        <span>· {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => void remove(item.discordId)} disabled={saving}
                      className="h-8 w-8 text-muted-foreground/40 hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
