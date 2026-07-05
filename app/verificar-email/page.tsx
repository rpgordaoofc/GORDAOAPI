"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VerificarEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verificado, setVerificado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("rpg_pending_email") || "seu e-mail";
    setEmail(e);

    // Simula recebimento do clique de verificação (em prod seria um link com token)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("verified") === "1") {
      setVerificado(true);
      localStorage.setItem("rpg_email_verified", "1");
    }
  }, []);

  const handleEntrar = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/entrar");
    }, 600);
  };

  // Simula verificação para demo (botão local)
  const handleSimularVerificacao = () => {
    setLoading(true);
    setTimeout(() => {
      setVerificado(true);
      localStorage.setItem("rpg_email_verified", "1");
      setLoading(false);
    }, 1000);
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

          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative h-14 w-14">
                <Image src="/RG.png" alt="RP GORDAO" fill className="object-contain" />
              </div>
            </div>

            {!verificado ? (
              <>
                {/* Ícone de email */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h1>
                <p className="text-white/40 text-sm mb-2">
                  Enviamos uma notificação de verificação para:
                </p>
                <p className="text-red-400 font-semibold text-sm mb-6 break-all">
                  {email}
                </p>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs text-white/50 leading-relaxed">
                    📧 Abra o e-mail que enviamos e clique no botão{" "}
                    <span className="text-red-400 font-semibold">"Verificar E-mail"</span>{" "}
                    para ativar sua conta. Após verificar, volte aqui para entrar.
                  </p>
                </div>

                {/* Botão de simular verificação para demo */}
                <button
                  onClick={handleSimularVerificacao}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                  style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "✓ Verificar E-mail"
                  )}
                </button>

                <p className="text-xs text-white/20">
                  Não recebeu?{" "}
                  <button className="text-red-400 hover:text-red-300 transition-colors">
                    Reenviar e-mail
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Verificado! */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-600/10 border border-green-500/40 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">E-mail Verificado!</h1>
                <p className="text-white/40 text-sm mb-8">
                  Sua conta foi verificada com sucesso. Agora você pode acessar o painel.
                </p>

                <button
                  onClick={handleEntrar}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}
                >
                  {loading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Entrar no Painel →"
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/10 mt-4">
          RP GORDAO © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
