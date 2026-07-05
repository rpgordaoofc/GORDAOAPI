"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    // Verifica se email foi verificado
    const verified = localStorage.getItem("rpg_email_verified");
    if (!verified) {
      setError("Você precisa verificar seu e-mail antes de entrar.");
      setLoading(false);
      return;
    }

    // Salva sessão do cliente
    localStorage.setItem("rpg_client_logged", "1");
    localStorage.setItem("rpg_client_email", email);
    router.push("/cliente");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060606] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-800/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)" }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium tracking-widest uppercase">RP GORDAO</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative h-14 w-14 mb-4">
                <Image src="/RG.png" alt="RP GORDAO" fill className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Entrar</h1>
              <p className="text-sm text-white/30 mt-1">Acesse sua conta RP GORDAO</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seuemail@gmail.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-600/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    disabled={loading}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-600/60 focus:bg-white/[0.06] transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-xs">
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar →"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-white/20 mt-6">
              Não tem conta?{" "}
              <Link href="/registrar" className="text-red-400 hover:text-red-300 transition-colors">
                Registrar
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/10 mt-4">
          RP GORDAO © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
