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
  Eye,
  EyeOff,
  UserPlus,
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

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setSuccessMessage(null);
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

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      setSuccessMessage("Account created successfully! Please sign in.");
      setIsRegistering(false);
      setEmail(registerEmail); // Pre-fill login email
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
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

  const welcomeSubtitleWords = "Welcome to the Nippon Toyota Smart Incentive Engine. Configure slab tiers, track monthly sales targets, and calculate high-velocity officer commissions in an elite secure environment.".split(" ");

  return (
    <div className="min-h-screen bg-[#080810] text-[#eeeff7] flex flex-col md:flex-row overflow-hidden select-none relative font-sans">
      {/* Top red accent hairline */}
      <div className="top-accent-bar" />

      {/* LEFT COLUMN: Cinematic brand hero panel with clipped slanted composición */}
      <div className="hidden md:flex md:w-[50%] lg:w-[56%] bg-[#0c0c16] relative items-center justify-center p-10 lg:p-16 overflow-hidden border-r border-white/[0.02] [clip-path:polygon(0_0,100%_0,93%_100%,0_100%)]">
        {/* Tokyo Night-Race Radial Mesh Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/toyota_camry_dusk.png"
            alt="Toyota Camry at Dusk"
            className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-[15000ms] ease-out select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-[#080810]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#080810]/35 to-[#080810]" />
          {/* Glowing brand orbs sways */}
          <div className="absolute top-[15%] right-[10%] w-[55%] h-[55%] rounded-full bg-[#c8102e]/[0.06] blur-[110px] animate-breathe" />
          <div className="absolute bottom-[10%] left-[5%] w-[45%] h-[45%] rounded-full bg-emerald-500/[0.03] blur-[90px] animate-breathe delay-1000" />
        </div>

        {/* Content container */}
        <div className="relative z-10 max-w-md w-full space-y-10 flex flex-col items-start text-left">
          {/* Custom Branded Tag */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-primary text-[9px] font-black uppercase tracking-widest leading-none shadow-xl"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Toyota Executive Hub
          </motion.div>

          {/* High-impact Typography */}
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] font-heading text-white"
            >
              Accelerate Your <br />
              <span className="inline-block mt-1 font-heading text-primary draw-underline pb-1.5">
                Sales Performance
              </span>
            </motion.h2>
            
            {/* Word-by-word progressive reveal subtitle */}
            <p className="text-xs text-[#85879b] leading-relaxed font-semibold max-w-sm">
              {welcomeSubtitleWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.015, duration: 0.15 }}
                  className="inline-block mr-1"
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </div>

          {/* Floating Camry Specs Translucent card overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="w-full bg-[#10101a]/70 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 shadow-2xl group cursor-pointer relative overflow-hidden"
          >
            {/* Soft inner glow gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 opacity-50 group-hover:opacity-85 transition-opacity duration-500" />
            
            <div className="flex justify-between items-start z-10 relative">
              <div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 w-fit">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SHOWCASE
                </span>
                <h3 className="text-base font-black text-white group-hover:text-primary transition-colors font-heading">Toyota Camry Hybrid</h3>
              </div>
              <span className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[8px] font-black text-slate-300 uppercase tracking-widest font-mono">
                2.5L DYNAMIC FORCE
              </span>
            </div>

            <p className="text-[10px] text-[#85879b] mt-3 z-10 relative leading-normal font-semibold">
              Self-charging hybrid electric drivetrain mapping cutting-edge efficiency with premium automotive performance configurations.
            </p>

            {/* Engineered Micro-signals stats */}
            <div className="grid grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/[0.04] z-10 relative w-full">
              {[
                { label: "LIVE SHOWCASE", val: "ACTIVE STATUS" },
                { label: "PERFORMANCE", val: "2.5L HYBRID" },
                { label: "LOCK READY", val: "AUDIT SECURE" },
                { label: "AI ENGINE", val: "GEMINI 2.5 FLASH" }
              ].map((sig, i) => (
                <div key={i} className="space-y-0.5 min-w-0">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest block leading-none truncate">{sig.label}</span>
                  <span className="text-[8px] font-black text-slate-250 tracking-tight block uppercase font-mono truncate mt-0.5">{sig.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
 
      {/* RIGHT COLUMN: Translucent Premium Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 relative overflow-hidden bg-[#080810]">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
 
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm space-y-6"
        >
          {/* Glassmorphic Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#10101a]/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-white/[0.04] relative"
          >
            {/* Toyota SVN Branded Header */}
            <div className="flex flex-col items-center justify-center mb-6 border-b border-white/[0.04] pb-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8102e] to-rose-700 shadow-lg shadow-primary/20 mb-3 ring-1 ring-white/10 group cursor-pointer btn-press">
                <svg className="w-8 h-8 text-white drop-shadow-md transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 4.69 2 8c0 3.31 4.48 6 10 6s10-2.69 10-6c0-3.31-4.48-6-10-6zm0 1.5c4.14 0 7.5 1.79 7.5 4S16.14 11.5 12 11.5 4.5 9.71 4.5 7.5s3.36-4 7.5-4z" />
                  <path d="M12 4.5c2.48 0 4.5 1.12 4.5 2.5 0 .89-.83 1.67-2.12 2.12L13.5 13h-3l-.88-3.88C8.33 8.67 7.5 7.89 7.5 7c0-1.38 2.02-2.5 4.5-2.5zm0 1.25c-1.52 0-2.75.56-2.75 1.25 0 .42.47.8 1.23 1.03l.63 2.76h1.78l.63-2.76c.76-.23 1.23-.61 1.23-1.03 0-.69-1.23-1.25-2.75-1.25z" />
                </svg>
              </div>
              <h1 className="text-lg font-black text-white tracking-widest font-heading leading-none">NIPPON TOYOTA</h1>
              <p className="text-slate-500 text-[8px] font-extrabold uppercase tracking-widest mt-1.5">Smart Incentive Engine</p>
            </div>
 
            {/* Inputs & Form Wrapper */}
            <div className="mb-5 space-y-4">
              {isRegistering ? (
                <>
                  <label className="block text-[9px] font-extrabold text-[#85879b] uppercase tracking-widest leading-none">
                    Create Sales Officer Account
                  </label>
                  <div className="relative group">
                    <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550 group-focus-within:text-[#c8102e] transition-colors shrink-0" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => { setRegisterName(e.target.value); setError(null); }}
                      placeholder="Full Name"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-[#080810]/50 hover:bg-[#080810]/80 border border-white/[0.06] focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]/20 rounded-xl text-white text-xs placeholder:text-slate-650 transition-all duration-200 disabled:opacity-40"
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550 group-focus-within:text-[#c8102e] transition-colors shrink-0" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => { setRegisterEmail(e.target.value); setError(null); }}
                      placeholder="you@nippytoyota.com"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-[#080810]/50 hover:bg-[#080810]/80 border border-white/[0.06] focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]/20 rounded-xl text-white text-xs placeholder:text-slate-650 transition-all duration-200 disabled:opacity-40"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550 group-focus-within:text-[#c8102e] transition-colors shrink-0" />
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => { setRegisterPassword(e.target.value); setError(null); }}
                      placeholder="Password (Min. 6 characters)"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-[#080810]/50 hover:bg-[#080810]/80 border border-white/[0.06] focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]/20 rounded-xl text-white text-xs placeholder:text-slate-650 transition-all duration-200 disabled:opacity-40"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRegister}
                    disabled={isLoading || !registerName.trim() || !registerEmail.trim() || registerPassword.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c8102e] hover:bg-[#e8192c] disabled:bg-primary/30 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-[0_4px_15px_rgba(200,16,46,0.3)] border border-white/5 btn-press shimmer-sweep cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                    ) : (
                      <>
                        Create Account
                        <UserPlus className="h-4 w-4 shrink-0 text-white" />
                      </>
                    )}
                  </motion.button>
                </>
              ) : (
                <>
                  <label className="block text-[9px] font-extrabold text-[#85879b] uppercase tracking-widest leading-none">
                    Sign in with credentials
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550 group-focus-within:text-[#c8102e] transition-colors shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="you@nippytoyota.com"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-[#080810]/50 hover:bg-[#080810]/80 border border-white/[0.06] focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]/20 rounded-xl text-white text-xs placeholder:text-slate-650 transition-all duration-200 disabled:opacity-40 font-mono"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550 group-focus-within:text-[#c8102e] transition-colors shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && email.trim() && password) handleLogin(email, password); }}
                      placeholder="Password"
                      disabled={isLoading}
                      className="w-full pl-11 pr-11 py-3 bg-[#080810]/50 hover:bg-[#080810]/80 border border-white/[0.06] focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]/20 rounded-xl text-white text-xs placeholder:text-slate-655 transition-all duration-200 disabled:opacity-40 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors shrink-0"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                    </button>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => email.trim() && password && handleLogin(email, password)}
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c8102e] hover:bg-[#e8192c] disabled:bg-primary/30 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(200,16,46,0.35)] border border-white/5 btn-press shimmer-sweep cursor-pointer"
                  >
                    {isLoading && !loadingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4 shrink-0 text-white" />
                      </>
                    )}
                  </motion.button>
                </>
              )}
 
              {/* Toggle form button */}
              <div className="text-center pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[9px] font-extrabold text-primary hover:underline hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  {isRegistering ? "Already have an account? Sign In" : "New Sales Officer? Create Account"}
                </button>
              </div>
            </div>
 
            {/* Success Banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[10px] font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {successMessage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
 
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-[10px] font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 animate-pulse" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
 
            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.04]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#10101a] px-3.5 text-[8px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                  <Zap className="h-3 w-3 text-amber-500/70" />
                  Quick Access
                </span>
              </div>
            </div>
 
            {/* Quick Access Account List */}
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account, index) => (
                <motion.button
                  key={account.email}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLogin(account.email, account.password)}
                  disabled={isLoading}
                  className="w-full group flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] hover:border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
                >
                  {/* Premium Gradient Avatar */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${account.bgInitial} shadow-md shrink-0 ring-1 ring-white/10`}>
                    <span className="text-white font-black text-[10px] tracking-tight">
                      {account.initial}
                    </span>
                  </div>
 
                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white/90 group-hover:text-white truncate transition-colors">
                        {account.name}
                      </span>
                      <span className={`text-[7px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                        account.role === "ADMIN"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {account.role === "ADMIN" ? "ADMIN" : "SALES"}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors truncate">
                      {account.description}
                    </p>
                  </div>
 
                  {/* Sliding Arrow Selector */}
                  <div className="shrink-0 overflow-hidden w-4 h-4 flex items-center justify-center">
                    {loadingEmail === account.email ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 text-slate-650 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
