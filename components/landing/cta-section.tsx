"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 noise" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-transparent to-transparent" />
          
          <div className="relative px-8 py-16 text-center sm:px-16 sm:py-24">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para ter controle total sobre suas licenças?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Acesse a dashboard administrativa e comece a gerenciar suas keys,
              usuários e produtos agora mesmo.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="group gap-2 px-8">
                <Link href="/dashboard">
                  Acessar Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
