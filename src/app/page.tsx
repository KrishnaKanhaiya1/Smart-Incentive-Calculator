"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  UserCircle,
  ArrowRight,
  Loader2,
  Zap,
  Mail,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    label: "Admin Portal",
    name: "Rajesh Kumar",
    email: "admin@nippytoyota.com",
    password: "admin123",
    role: "ADMIN" as const,
    icon: ShieldCheck,
    gradient: "from-primary via-primary to-primary",
    hoverGlow: "hover:shadow-primary/20",
    ringColor: "ring-primary/20",
    description: "Configure slabs & manage inventory",
    initial: "RK",
    bgInitial: "bg-gradient-to-br from-primary to-primary",
  },
  {
    label: "Sales Officer",
    name: "Anita Sharma",
    email: "anita.sharma@nippytoyota.com",
    password: "sales123",
    role: "SALES" as const,
    icon: UserCircle,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    hoverGlow: "hover:shadow-emerald-500/20",
    ringColor: "ring-emerald-500/20",
    description: "Track performance & log sales",
    initial: "AS",
    bgInitial: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    label: "Sales Officer",
    name: "Vikram Patel",
    email: "vikram.patel@nippytoyota.com",
    password: "sales123",
    role: "SALES" as const,
    icon: UserCircle,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    hoverGlow: "hover:shadow-amber-500/20",
    ringColor: "ring-amber-500/20",
    description: "Track performance & log sales",
    initial: "VP",
    bgInitial: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        router.replace(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
      })
      .catch(() => {
        setCheckingSession(false);
      });
  }, [router]);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setLoadingEmail(loginEmail);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setIsLoading(false);
      setLoadingEmail(null);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-primary/[0.07] blur-[100px] animate-breathe" />
        <div className="absolute -bottom-[30%] -right-[15%] w-[60%] h-[60%] rounded-full bg-primary/[0.06] blur-[100px] animate-breathe delay-1000" />
        <div className="absolute top-[15%] right-[5%] w-[35%] h-[35%] rounded-full bg-emerald-600/[0.04] blur-[80px] animate-breathe delay-500" />
        <div className="absolute bottom-[15%] left-[5%] w-[25%] h-[25%] rounded-full bg-amber-500/[0.03] blur-[60px] animate-breathe delay-700" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Branding */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary shadow-xl shadow-primary/25 mb-5 ring-1 ring-white/10"
          >
            <span className="text-white font-black text-2xl tracking-tighter">
              NT
            </span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Nippon Toyota
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide">
            Smart Incentive Calculator
          </p>
        </motion.div>

        {/* Main login card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06]"
        >
          {/* Email & Password login */}
          <div className="mb-5 space-y-3">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-2.5">
              Sign in with credentials
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@nippytoyota.com"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-white/[0.06] transition-all duration-200 disabled:opacity-40"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter" && email.trim() && password) handleLogin(email, password); }}
                placeholder="Password"
                disabled={isLoading}
                className="w-full pl-11 pr-11 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-white/[0.06] transition-all duration-200 disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => email.trim() && password && handleLogin(email, password)}
              disabled={isLoading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 ring-1 ring-white/10"
            >
              {isLoading && !loadingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0a0a0f]/70 backdrop-blur-sm px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500/70" />
                Quick Access
              </span>
            </div>
          </div>

          {/* Quick-access cards */}
          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((account, index) => (
              <motion.button
                key={account.email}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin(account.email, account.password)}
                disabled={isLoading}
                className={`w-full group flex items-center gap-3.5 p-3.5 rounded-xl border border-white/[0.05] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/10 ${account.hoverGlow} hover:shadow-xl ring-1 ${account.ringColor} ring-opacity-0 hover:ring-opacity-100`}
              >
                {/* Avatar */}
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${account.bgInitial} shadow-md shrink-0 ring-1 ring-white/20`}>
                  <span className="text-white font-bold text-sm tracking-tight">
                    {account.initial}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white/90 group-hover:text-white truncate transition-colors">
                      {account.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md border shrink-0 ${
                      account.role === "ADMIN"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    }`}>
                      {account.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 group-hover:text-slate-500 transition-colors">
                    {account.description}
                  </p>
                </div>

                {/* Arrow / Loading */}
                <div className="shrink-0">
                  {loadingEmail === account.email ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center justify-center gap-2 mt-7"
        >
          <Sparkles className="h-3 w-3 text-slate-700" />
          <p className="text-[11px] text-slate-700 font-medium tracking-wide">
            Role-Based Access Control &middot; Enterprise Grade
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
