"use client";

import React from "react";
import { motion } from "framer-motion";
import { LogOut, Loader2, BarChart3 } from "lucide-react";
import SalesDashboard from "@/components/SalesDashboard";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user: session, loading: checking, logout } = useAuth("SALES");

  if (checking || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-slate-950 font-sans antialiased">
      <Toaster position="top-right" richColors closeButton />

      {/* Premium Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] gradient-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary text-white w-9 h-9 rounded-xl font-black tracking-tighter text-sm shrink-0 shadow-md shadow-primary/20 flex items-center justify-center ring-1 ring-black/5">
              NT
            </div>
            <div className="min-w-0 hidden sm:block">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-[15px] block">
                Nippon Toyota
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Sales Performance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle />

            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100/80 dark:border-emerald-800/30 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm text-white text-[10px] font-bold">
                {initials}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-semibold text-slate-800 dark:text-white block leading-tight">
                  {session.name}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">
                  Sales Officer
                </span>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={logout}
              className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm shadow-emerald-500/5">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-0.5 leading-none">
                Sales Officer Engine
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Welcome back, {session.name}!
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 pl-13 font-medium leading-relaxed">
            Let's crush your targets and maximize your tiered slabs dynamic commission incentives for this period.
          </p>
        </motion.div>

        <SalesDashboard userId={session.id} />
      </main>
    </div>
  );
}
