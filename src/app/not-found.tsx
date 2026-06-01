"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-primary/[0.07] blur-[100px] animate-breathe" />
      <div className="absolute -bottom-[30%] -right-[15%] w-[60%] h-[60%] rounded-full bg-primary/[0.06] blur-[100px] animate-breathe delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 border border-white/10 mb-6"
        >
          <Compass className="h-10 w-10 text-indigo-400 animate-float" />
        </motion.div>

        <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
          4<span className="text-gradient">0</span>4
        </h1>
        <p className="text-slate-500 text-sm font-medium mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}
