"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Car,
  Layers,
  LogOut,
  Loader2,
  Settings2,
  BarChart3,
  User,
} from "lucide-react";
import VisualSlabBuilder from "@/components/VisualSlabBuilder";
import CarInventoryManager from "@/components/CarInventoryManager";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminApprovalsManager from "@/components/AdminApprovalsManager";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

const TABS = [
  { id: "inventory", label: "Car Inventory", icon: Car, description: "Manage vehicle models" },
  { id: "slabs", label: "Slab Engine", icon: Layers, description: "Configure incentive tiers" },
  { id: "approvals", label: "Approvals", icon: ShieldCheck, description: "Verify monthly submissions" },
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Performance insight charts" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPortal() {
  const { user: session, loading: checking, logout } = useAuth("ADMIN");
  const [activeTab, setActiveTab] = useState<TabId>("inventory");

  if (checking || !session) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <Toaster position="top-right" richColors closeButton />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
          <span className="text-[10px] font-black uppercase text-slate-550 tracking-widest">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] text-[#eeeff7] font-sans antialiased select-none relative">
      <Toaster position="top-right" richColors closeButton />

      {/* Top Accent Hairline Red Gradient */}
      <div className="top-accent-bar" />

      {/* Premium Glass Header nav */}
      <header className="glass sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary text-white w-9 h-9 rounded-xl font-black tracking-tighter text-sm shrink-0 shadow-lg shadow-primary/20 flex items-center justify-center ring-1 ring-white/10 btn-press">
              NT
            </div>
            <div className="min-w-0 hidden sm:block">
              <span className="font-black text-white tracking-widest text-xs block font-heading leading-none">
                NIPPON TOYOTA
              </span>
              <span className="text-[8px] text-slate-555 font-extrabold tracking-widest uppercase block mt-1">
                Admin Configuration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DarkModeToggle />

            {/* Profile User Badge block */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-xl shadow-lg ring-1 ring-white/[0.02]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-rose-700 flex items-center justify-center shadow-md ring-1 ring-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-white shrink-0" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-white block leading-tight">
                  {session.name}
                </span>
                <span className="text-[8px] text-primary font-black uppercase tracking-wider block mt-0.5 leading-none">
                  ADMINISTRATOR
                </span>
              </div>
            </div>

            {/* Secure Logout CTA */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={logout}
              className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-[#c8102e] hover:bg-white/[0.02] border border-white/[0.04] hover:border-red-500/20 rounded-xl transition-all duration-300 shadow-md cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Command Surface */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-6">
        {/* Title block with red accent vertical bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-3 border-b border-white/[0.04] pb-5"
        >
          <div className="w-1 h-8 bg-primary rounded-full shrink-0" />
          <div className="space-y-1">
            <h1 className="text-xl font-black text-white tracking-tight leading-none font-heading uppercase">
              Configuration Panel
            </h1>
            <p className="text-xs text-slate-500 font-semibold max-w-lg">
              Authorized admin dashboard. Configure dynamic incentive slab tables, manage model inventories, verify submissions, and inspect business metrics.
            </p>
          </div>
        </motion.div>

        {/* Tab Segmented Controls */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 w-full sm:w-auto justify-start border cursor-pointer ${
                  isActive
                    ? "text-white border-white/[0.08]"
                    : "text-[#85879b] border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-tab"
                    className="absolute inset-0 bg-white/[0.03] rounded-2xl shadow-xl ring-1 ring-white/[0.06]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 border ${
                    isActive
                      ? "bg-primary border-primary/20 shadow-md shadow-primary/10 text-white"
                      : "bg-[#080810] border-white/[0.04] text-slate-500 group-hover:text-white"
                  }`}>
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="text-left hidden sm:block min-w-0">
                    <div className="text-xs font-black tracking-wide leading-none font-heading uppercase text-white">
                      {tab.label}
                    </div>
                    <div className="text-[8px] text-slate-555 font-extrabold uppercase mt-1 leading-none tracking-wider truncate">
                      {tab.description}
                    </div>
                  </div>
                  <span className="sm:hidden text-xs uppercase font-extrabold">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Dynamic Tab Views transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "inventory" ? (
              <div className="bg-[#10101a] border border-white/[0.04] rounded-2xl p-6 shadow-2xl relative">
                <div className="mb-6 flex items-center gap-3 pb-4 border-b border-white/[0.03]">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-md">
                    <Car className="h-4.5 w-4.5 text-primary shrink-0" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white font-heading uppercase leading-none">
                      Vehicle Model Registry
                    </h2>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Configure active car lineups. Active variants populate instantly across sales officer trackers.
                    </p>
                  </div>
                </div>
                <CarInventoryManager />
              </div>
            ) : activeTab === "slabs" ? (
              <VisualSlabBuilder />
            ) : activeTab === "approvals" ? (
              <div className="bg-[#10101a] border border-white/[0.04] rounded-2xl p-6 shadow-2xl">
                <AdminApprovalsManager />
              </div>
            ) : (
              <AdminAnalytics />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}