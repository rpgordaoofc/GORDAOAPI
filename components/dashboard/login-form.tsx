"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

export function LoginForm() {
  const [mode, setMode] = useState<"admin" | "owner">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ownerToken, setOwnerToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginOwner } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result =
      mode === "owner" ? await loginOwner(ownerToken) : await login(username, password);
    if (!result.ok) setError(result.message || "Credenciais inválidas.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-800/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium tracking-widest uppercase">RP GORDAO</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Top accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

          <div className="p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Dashboard Admin
              </h1>
              <p className="text-sm text-white/30 mt-1">
                {mode === "owner" ? "Acesso restrito ao proprietário" : "Entre com suas credenciais"}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.06]">
              {(["admin", "owner"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    mode === m
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {m === "admin" ? "Admin" : "Owner"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "owner" ? (
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    placeholder="Cole o secret key..."
                    value={ownerToken}
                    onChange={(e) => { setOwnerToken(e.target.value); setError(""); }}
                    disabled={isLoading}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-600/60 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                      Usuário
                    </label>
                    <input
                      type="text"
                      placeholder="Digite seu usuário..."
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      disabled={isLoading}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-600/60 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha..."
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        disabled={isLoading}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red-600/60 focus:bg-white/[0.06] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (mode === "owner" ? !ownerToken.trim() : (!username.trim() || !password.trim()))}
                className="w-full mt-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Acessar Dashboard"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-white/20 mt-6">
              RP GORDAO © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
