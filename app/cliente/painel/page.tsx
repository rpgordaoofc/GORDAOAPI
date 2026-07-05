"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ClientePainelPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const logged = localStorage.getItem("rpg_client_logged");
    if (!logged) {
      router.replace("/entrar");
      return;
    }
    setEmail(localStorage.getItem("rpg_client_email") || "cliente@email.com");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("rpg_client_logged");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#060606] relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-red-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)" }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 shrink-0">
            <Image src="/RG.png" alt="RP GORDAO" fill className="object-contain" />
          </div>
          <span className="text-white font-black tracking-widest uppercase text-sm">RP GORDAO</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs hidden sm:block truncate max-w-[200px]">{email}</span>
          <button onClick={handleLogout}
            className="text-white/30 hover:text-white/70 text-xs border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
            Sair
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-mono tracking-widest uppercase">Plano Ativo</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Meu Painel</h1>
          <p className="text-white/40 text-sm">Gerencie suas licenças e keys</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Licenças Ativas", value: "50", icon: "🔑" },
            { label: "Dias Restantes", value: "30", icon: "📅" },
            { label: "Plano", value: "Mensal", icon: "⚡" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111111] border border-white/[0.06] rounded-xl p-4">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Keys */}
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Suas Keys</h2>
              <span className="text-white/30 text-xs border border-white/[0.08] px-2 py-1 rounded-lg">0 / 50 usadas</span>
            </div>

            <div className="text-center py-10">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-white/40 text-sm">Nenhuma key gerada ainda</p>
              <p className="text-white/20 text-xs mt-1">As keys aparecerão aqui assim que forem criadas</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Precisa de ajuda?</p>
            <p className="text-white/30 text-xs mt-0.5">Fale com o suporte no Discord</p>
          </div>
          <a
            href="https://discord.gg/rpgordao"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Discord
          </a>
        </div>
      </div>
    </div>
  );
}
