"use client";

import React, { createContext, useContext, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/dashboard/login-form";

// Sidebar context for sharing state between layout and pages
interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggle: () => {},
  close: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const sidebarContext: SidebarContextType = {
  sidebarOpen,
  setSidebarOpen,
  toggle: () => setSidebarOpen((v) => !v),
  close: () => setSidebarOpen(false),
};


  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <SidebarContext.Provider value={sidebarContext}>
      {/* Animated background */}
      <div className="animated-bg" aria-hidden="true" />
      <div className="animated-grid" aria-hidden="true" />
      <div className="animated-glow animated-glow-1" aria-hidden="true" />
      <div className="animated-glow animated-glow-2" aria-hidden="true" />

      <div className="relative z-10 min-h-screen bg-background/60">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardContent>{children}</DashboardContent>
      </ToastProvider>
    </AuthProvider>
  );
}
