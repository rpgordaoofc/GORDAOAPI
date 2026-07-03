"use client";
import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import { useSidebar } from "../layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { TagIcon, TrashIcon, PlusIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "motion/react";

interface Coupon { _id: string; code: string; type: "days"|"percent"; value: number; maxUses: number|null; usedCount: number; active: boolean; expiresAt: string|null; description: string|null; createdAt: string; }

export default function CouponsPage() {
  const { toggle } = useSidebar();
  const { addToast } = useToast();
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState(""); const [type, setType] = useState<"days"|"percent">("days");
  const [value, setValue] = useState(""); const [maxUses, setMaxUses] = useState("");
  const [description, setDescription] = useState(""); const [expiresAt, setExpiresAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api-proxy/v1/admin/coupons", { credentials: "include" });
      const data = await res.json();
      if (data.success) setItems(data.data?.items ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!code.trim() || !value) return;
    setSaving(true);
    try {
      const res = await fetch("/api-proxy/v1/admin/coupons", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim().toUpperCase(), type, value: Number(value), maxUses: maxUses ? Number(maxUses) : null, description: description || null, expiresAt: expiresAt || null }) });
      const data = await res.json();
      if (data.success) { addToast({ title: "Cupom criado!", description: `Código: ${code.toUpperCase()}`, variant: "success" }); setCode(""); setValue(""); setMaxUses(""); setDescription(""); setExpiresAt(""); void load(); }
      else addToast({ title: "Erro", description: data.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    setSaving(true);
    try {
      await fetch(`/api-proxy/v1/admin/coupons/${id}`, { method: "DELETE", credentials: "include" });
      addToast({ title: "Cupom removido", description: "", variant: "success" });
      void load();
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen">
      <Header title="Cupons" description="Codigos de desconto e dias extras" onMenuClick={toggle} />
      <main className="p-4 lg:p-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4"><TagIcon className="h-4 w-4 text-primary" />Criar Cupom</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Codigo (ex: PROMO10)" className="bg-white/[0.03] border-white/8 h-9 text-sm font-mono" />
            <select value={type} onChange={e => setType(e.target.value as "days"|"percent")} className="h-9 rounded-lg border border-white/8 bg-white/[0.03] px-3 text-sm text-foreground appearance-none">
              <option value="days">Dias extras</option>
              <option value="percent">% desconto</option>
            </select>
            <Input value={value} onChange={e => setValue(e.target.value)} placeholder={type === "days" ? "Quantidade de dias" : "Porcentagem (ex: 20)"} className="bg-white/[0.03] border-white/8 h-9 text-sm" type="number" />
            <Input value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Max usos (vazio = ilimitado)" className="bg-white/[0.03] border-white/8 h-9 text-sm" type="number" />
            <Input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} placeholder="Expira em" className="bg-white/[0.03] border-white/8 h-9 text-sm" type="datetime-local" />
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descricao (opcional)" className="bg-white/[0.03] border-white/8 h-9 text-sm" />
          </div>
          <Button onClick={add} disabled={saving || !code.trim() || !value} className="mt-3 bg-primary hover:bg-primary/90 h-9 gap-2">
            <PlusIcon className="h-4 w-4" />Criar Cupom
          </Button>
        </motion.div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{items.length}</span> cupom(s)</p>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="h-8 w-8 p-0 border border-white/8 bg-white/[0.02]"><ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
        </div>

        {loading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-white/[0.02] animate-pulse" />)}</div> : (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((c, i) => (
                <motion.div key={c._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${c.active ? "bg-green-400" : "bg-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm">{c.code}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${c.type === "days" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400"}`}>{c.type === "days" ? `+${c.value} dias` : `${c.value}% off`}</span>
                      {c.maxUses && <span className="text-[11px] text-muted-foreground">{c.usedCount}/{c.maxUses} usos</span>}
                    </div>
                    {c.description && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{c.description}</p>}
                  </div>
                  {c.expiresAt && <span className="text-[11px] text-muted-foreground/50 hidden sm:block">{new Date(c.expiresAt).toLocaleDateString("pt-BR")}</span>}
                  <Button variant="ghost" size="icon" onClick={() => void del(c._id)} disabled={saving} className="h-8 w-8 text-muted-foreground/40 hover:text-red-400"><TrashIcon className="h-4 w-4" /></Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
