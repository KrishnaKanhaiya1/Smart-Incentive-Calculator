"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Car,
  Layers,
  LogOut,
  Loader2,
  Settings2,
  BarChart3,
} from "lucide-react";
import VisualSlabBuilder from "@/components/VisualSlabBuilder";
import CarInventoryManager from "@/components/CarInventoryManager";
import AdminAnalytics from "@/components/AdminAnalytics";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

const TABS = [
  { id: "inventory", label: "Car Inventory", icon: Car, description: "Manage vehicle models" },
  { id: "slabs", label: "Slab Engine", icon: Layers, description: "Configure incentive tiers" },
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Performance insight charts" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPortal() {
  const { user: session, loading: checking, logout } = useAuth("ADMIN");
  const [activeTab, setActiveTab] = useState<TabId>("inventory");

  if (checking || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-slate-950 font-sans antialiased">
      <Toaster position="top-right" richColors closeButton />

      {/* Premium Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] gradient-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary text-white w-9 h-9 rounded-xl font-black tracking-tighter text-sm shrink-0 shadow-md shadow-primary/20 flex items-center justify-center ring-1 ring-black/5">
              NT
            </div>
            <div className="min-w-0 hidden sm:block">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-[15px] block">
                Nippon Toyota
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Admin Configuration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle />

            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-100/80 dark:border-violet-800/30 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-semibold text-slate-800 dark:text-white block leading-tight">
                  {session.name}
                </span>
                <span className="text-[10px] text-violet-500 dark:text-violet-400 font-medium leading-tight">
                  Administrator
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Settings2 className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Configuration Panel
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 pl-7">
            Manage your vehicle lineup and define dynamic incentive tier structures.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex gap-2 mb-8"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "text-slate-900 dark:text-white bg-white dark:bg-slate-800 shadow-md shadow-black/[0.04] ring-1 ring-slate-200/80 dark:ring-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-tab"
                    className="absolute inset-0 bg-white dark:bg-slate-800 shadow-md shadow-black/[0.04] rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-700"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-primary shadow-sm shadow-primary/20"
                      : "bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                  }`}>
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className={`text-sm font-semibold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                      {tab.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {tab.description}
                    </div>
                  </div>
                  <span className="sm:hidden">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === "inventory" ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Vehicle Model Registry
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add, edit, or deactivate car models. Active models appear in the Sales Portal.
                  </p>
                </div>
              </div>
              <CarInventoryManager />
            </div>
          ) : activeTab === "slabs" ? (
            <VisualSlabBuilder />
          ) : (
            <AdminAnalytics />
          )}
        </motion.div>
      </main>
    </div>
  );
}