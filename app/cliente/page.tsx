"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  priceLabel: string;
  keyLimit: number;
  color: string;
  glow: string;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    id: "1mes",
    name: "Plano Mensal",
    duration: "1 Mês",
    price: 15,
    priceLabel: "R$ 15,00",
    keyLimit: 50,
    color: "border-red-600/40",
    glow: "rgba(220,38,38,0.25)",
  },
  {
    id: "3mes",
    name: "Plano Trimestral",
    duration: "3 Meses",
    price: 75,
    priceLabel: "R$ 75,00",
    keyLimit: 150,
    color: "border-yellow-500/40",
    glow: "rgba(234,179,8,0.2)",
    badge: "MAIS POPULAR",
  },
];

function PaymentModal({ plan, onClose, onPaid }: { plan: Plan; onClose: () => void; onPaid: () => void }) {
  const [copied, setCopied] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const pixCode = plan.id === "1mes"
    ? "00020126580014BR.GOV.BCB.PIX0136rpgordao-1mes@gmail.com5204000053039865802BR5913RP GORDAO API6009SAO PAULO62070503***6304ABCD"
    : "00020126580014BR.GOV.BCB.PIX0136rpgordao-3mes@gmail.com5204000053039865802BR5913RP GORDAO API6009SAO PAULO62070503***6304EFGH";

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}&bgcolor=111111&color=ffffff&margin=12`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#111111] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-lg">{plan.name}</h2>
              <p className="text-white/40 text-xs">Pagamento via Pix · Mercado Pago</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl">✕</button>
          </div>

          <div className="text-center mb-5">
            <span className="text-4xl font-black text-white">{plan.priceLabel}</span>
            <p className="text-white/30 text-xs mt-1">{plan.duration} · {plan.keyLimit} licenças</p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code Pix" width={180} height={180} className="rounded-lg" />
            </div>
          </div>

          <p className="text-center text-xs text-white/30 mb-3">Escaneie o QR Code com seu app do banco</p>

          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 font-mono text-[10px] text-white/30 truncate">
              {pixCode.slice(0, 40)}...
            </div>
            <button onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${copied ? "bg-green-600 text-white" : "bg-white/[0.07] hover:bg-white/[0.12] text-white/60 border border-white/[0.08]"}`}>
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>

          <button
            onClick={() => { setConfirmLoading(true); setTimeout(onPaid, 1200); }}
            disabled={confirmLoading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}
          >
            {confirmLoading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Já paguei →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaidModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#111111] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl text-center">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        <div className="p-8">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-green-600/10 border border-green-500/40 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
          <p className="text-white/40 text-sm mb-8">{plan.priceLabel} · {plan.name} · {plan.keyLimit} licenças ativas</p>
          <div className="flex flex-col gap-3">
            <Link href="/cliente/painel"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center"
              style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}>
              Ir para o Painel →
            </Link>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xs">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

type SessionUser = { name: string; email: string; image?: string; provider: string } | null;

export default function ClienteDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paidPlan, setPaidPlan] = useState<Plan | null>(null);

  useEffect(() => {
    // Lê cookie de sessão
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : null;
    };
    const raw = getCookie("rpg_session");
    if (!raw) {
      router.replace("/registrar");
      return;
    }
    try {
      const decoded = JSON.parse(atob(raw));
      setUser(decoded);
    } catch {
      router.replace("/registrar");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <span className="h-8 w-8 rounded-full border-2 border-red-600/30 border-t-red-600 animate-spin" />
      </div>
    );
  }

  const userName = user?.name || "Cliente";
  const userEmail = user?.email || "";
  const userImage = user?.image;

  return (
    <div className="min-h-screen bg-[#060606] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-red-600/8 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)" }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 shrink-0">
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
        <div className="flex items-center gap-3">
          {userImage && (
            <img src={userImage} alt={userName} className="w-7 h-7 rounded-full border border-white/10" />
          )}
          <span className="text-white/40 text-xs hidden sm:block truncate max-w-[160px]">{userEmail}</span>
          <button onClick={handleLogout}
            className="text-white/30 hover:text-white/70 text-xs border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
            Sair
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-1.5 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-mono tracking-[0.2em] uppercase">Olá, {userName.split(" ")[0]}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3"
            style={{ textShadow: "0 0 40px rgba(220,38,38,0.2)" }}>
            Planos &{" "}
            <span className="text-red-600" style={{ textShadow: "0 0 30px rgba(220,38,38,0.5)" }}>Preços</span>
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Gerencie licenças e keys. Ative seu plano agora via Pix.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className={`relative bg-[#111111] border ${plan.color} rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
              style={{ boxShadow: `0 0 40px ${plan.glow}` }}>
              {plan.badge && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider">
                  {plan.badge}
                </div>
              )}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
              <div className="p-7">
                <h2 className="text-white font-bold text-xl mb-1">{plan.name}</h2>
                <p className="text-white/40 text-sm mb-5">{plan.duration} de acesso</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">{plan.priceLabel}</span>
                  <span className="text-white/30 text-sm ml-2">/ {plan.duration.toLowerCase()}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {[`Até ${plan.keyLimit} licenças/keys`, `Duração de ${plan.duration}`, "Painel de gerenciamento", "Suporte via Discord"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                      <span className="text-red-500">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setSelectedPlan(plan)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase transition-all relative overflow-hidden group"
                  style={{ boxShadow: "0 0 25px rgba(220,38,38,0.3)" }}>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Comprar agora <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-white/20 text-xs">
          Pagamento via Pix · Processado pelo Mercado Pago · Ativação imediata
        </p>
      </div>

      {selectedPlan && !paidPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)}
          onPaid={() => { setPaidPlan(selectedPlan); setSelectedPlan(null); }} />
      )}
      {paidPlan && <PaidModal plan={paidPlan} onClose={() => setPaidPlan(null)} />}
    </div>
  );
}
