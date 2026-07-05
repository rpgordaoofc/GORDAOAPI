"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.135 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function EntrarPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDiscord, setLoadingDiscord] = useState(false);

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/cliente" });
  };

  const handleDiscord = async () => {
    setLoadingDiscord(true);
    await signIn("discord", { callbackUrl: "/cliente" });
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
              <p className="text-sm text-white/30 mt-1 text-center">
                Acesse sua conta RP GORDAO
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogle}
                disabled={loadingGoogle || loadingDiscord}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg"
              >
                {loadingGoogle ? (
                  <span className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-gray-800 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {loadingGoogle ? "Redirecionando..." : "Entrar com Google"}
              </button>

              <button
                onClick={handleDiscord}
                disabled={loadingGoogle || loadingDiscord}
                className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg"
              >
                {loadingDiscord ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <DiscordIcon />
                )}
                {loadingDiscord ? "Redirecionando..." : "Entrar com Discord"}
              </button>
            </div>

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
