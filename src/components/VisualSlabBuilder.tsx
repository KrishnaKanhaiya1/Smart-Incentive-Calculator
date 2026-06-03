"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowDown,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateIncentiveSlabs, SlabInput } from "@/lib/validations";
import { toast } from "sonner";
import SlabHistory, { SlabHistoryLog } from "@/components/SlabHistory";

const TIER_THEMES = [
  { label: "Bronze Tier", bg: "bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30", border: "border-amber-200/80 dark:border-amber-800/40", icon: "🥉" },
  { label: "Silver Tier", bg: "bg-slate-50/50 dark:bg-slate-800/30 text-slate-800 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/30", border: "border-slate-200/80 dark:border-slate-700/40", icon: "🥈" },
  { label: "Gold Tier", bg: "bg-yellow-50/50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300 border-yellow-200/50 dark:border-yellow-800/30", border: "border-yellow-200/80 dark:border-yellow-800/40", icon: "🥇" },
  { label: "Platinum Tier", bg: "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border-primary/50 dark:border-primary/30", border: "border-primary/80 dark:border-primary/40", icon: "💎" },
  { label: "Diamond Tier", bg: "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border-primary/50 dark:border-primary/30", border: "border-primary/80 dark:border-primary/40", icon: "👑" },
];

export default function VisualSlabBuilder() {
  const [slabs, setSlabs] = useState<SlabInput[]>([
    { minUnits: 1, maxUnits: 3, incentivePerCar: 1000 },
  ]);
  const [history, setHistory] = useState<SlabHistoryLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing slabs and history from database (auth via JWT cookie)
  const loadConfigAndHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/slabs?history=true");
      if (!res.ok) throw new Error("Failed to load existing slab configuration.");
      const data = await res.json();

      const slabData = Array.isArray(data) ? data : data.slabs || [];
      const historyData = Array.isArray(data) ? [] : data.history || [];

      if (slabData.length > 0) {
        setSlabs(
          slabData.map((s: { minUnits: number; maxUnits: number | null; incentivePerCar: number }) => ({
            minUnits: s.minUnits,
            maxUnits: s.maxUnits,
            incentivePerCar: s.incentivePerCar,
          }))
        );
      }
      setHistory(historyData);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load existing slab configuration.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigAndHistory();
  }, [loadConfigAndHistory]);

  // Live validation on every slab change
  useEffect(() => {
    const result = validateIncentiveSlabs(slabs);
    setErrorMsg(result.isValid ? null : result.error || "Validation error");
    if (result.isValid) setSuccessMsg(null);
  }, [slabs]);

  const updateSlab = useCallback(
    (index: number, field: keyof SlabInput, value: number | null) => {
      setSlabs((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
      setSuccessMsg(null);
    },
    []
  );

  const addSlab = useCallback(() => {
    setSlabs((prev) => {
      const last = prev[prev.length - 1];
      const nextMin = last && last.maxUnits !== null ? last.maxUnits + 1 : 1;
      return [...prev, { minUnits: nextMin, maxUnits: null, incentivePerCar: 0 }];
    });
    setSuccessMsg(null);
  }, []);

  const removeSlab = useCallback((index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
    setSuccessMsg(null);
  }, []);

  const saveConfiguration = async () => {
    const validation = validateIncentiveSlabs(slabs);
    if (!validation.isValid) return;

    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const response = await fetch("/api/admin/slabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slabs }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server rejected the configuration.");
      }

      toast.success("Slab configuration published successfully and is now live.");
      setSuccessMsg("Configuration published successfully and is now live.");
      setErrorMsg(null);
      await loadConfigAndHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save slab configuration.";
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const suggestWithGemini = async () => {
    setIsLoadingGemini(true);
    try {
      const response = await fetch("/api/admin/suggest-slabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCars: [],
          currentSlabs: slabs,
          salesVolume: 50,
          targetPayout: 100000,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get suggestions from Gemini");
      }

      const data = await response.json();
      toast.info("Gemini has provided slab suggestions. Review and apply them.");
      console.log("Gemini suggestions:", data.suggestions);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate suggestions";
      toast.error(msg);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const adjacencyIndicators = useMemo(() => {
    const indicators: {
      type: "continuous" | "gap" | "overlap" | "unreachable";
      message: string;
    }[] = [];

    for (let i = 0; i < slabs.length - 1; i++) {
      const curr = slabs[i];
      const next = slabs[i + 1];

      if (curr.maxUnits === null) {
        indicators.push({
          type: "unreachable",
          message: `Slab ${i + 2} is unreachable because Slab ${i + 1} is open-ended.`,
        });
      } else if (next.minUnits === curr.maxUnits + 1) {
        indicators.push({
          type: "continuous",
          message: `Continuous flow: Starts at ${next.minUnits}`,
        });
      } else if (next.minUnits > curr.maxUnits + 1) {
        indicators.push({
          type: "gap",
          message: `Gap: Missing units between ${curr.maxUnits} and ${next.minUnits}`,
        });
      } else {
        indicators.push({
          type: "overlap",
          message: `Overlap: Range duplicated between ${next.minUnits} and ${curr.maxUnits}`,
        });
      }
    }
    return indicators;
  }, [slabs]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto border-slate-200/80 dark:border-slate-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dynamic Tier Configuration Engine
          </CardTitle>
          <CardDescription>Loading current slab configuration...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
          <div className="h-10 w-44 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-3xl mx-auto border-slate-200/80 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-violet-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dynamic Tier Configuration Engine
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Configure scalable sales incentive parameters. Tiers must remain perfectly sequential with zero overlap.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* Error banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-2.5 p-3.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold uppercase tracking-wider block text-[10px] text-rose-800 dark:text-rose-300">Rule Violation Detected</span>
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success banner */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2.5 p-3.5 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slab rows */}
          <div className="relative pl-0 sm:pl-4 space-y-4">
            <div className="absolute left-[26px] top-6 bottom-6 w-[2px] bg-slate-100 dark:bg-slate-800 hidden sm:block pointer-events-none" />

            {slabs.map((slab, idx) => {
              const theme = TIER_THEMES[Math.min(idx, TIER_THEMES.length - 1)];

              return (
                <React.Fragment key={`slab-fragment-${idx}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 ${theme.bg} ${theme.border}`}
                  >
                    <div className="absolute sm:static -top-2.5 -left-2 sm:-left-0 shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-sm font-extrabold relative z-10">
                      <span className="sm:hidden text-xs">{idx + 1}</span>
                      <span className="hidden sm:inline">{theme.icon}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Min Units</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={slab.minUnits}
                          onChange={(e) => {
                            const text = e.target.value.replace(/[^0-9]/g, "");
                            const val = text === "" ? 0 : parseInt(text, 10);
                            updateSlab(idx, "minUnits", val);
                          }}
                          className="bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 h-9 text-xs font-mono font-bold text-slate-800 dark:text-white focus-visible:ring-indigo-500/20"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Max Units</label>
                        <Input
                          type="text"
                          placeholder="∞ (Open)"
                          value={slab.maxUnits === null ? "" : slab.maxUnits}
                          onChange={(e) => {
                            const text = e.target.value.trim().replace(/[^0-9]/g, "");
                            updateSlab(idx, "maxUnits", text === "" ? null : parseInt(text, 10));
                          }}
                          className="bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 h-9 text-xs font-mono font-bold text-slate-800 dark:text-white focus-visible:ring-indigo-500/20"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">₹ / Car Rate</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Incentive"
                          value={slab.incentivePerCar}
                          onChange={(e) => {
                            const text = e.target.value.replace(/[^0-9]/g, "");
                            const val = text === "" ? 0 : parseInt(text, 10);
                            updateSlab(idx, "incentivePerCar", val);
                          }}
                          className="bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 h-9 text-xs font-mono font-black text-slate-800 dark:text-white focus-visible:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlab(idx)}
                      disabled={slabs.length <= 1}
                      className="hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 text-slate-400 transition-colors self-end sm:self-center shrink-0 w-9 h-9 rounded-xl active:scale-95 disabled:opacity-30 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                      aria-label={`Remove slab tier ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>

                  {idx < slabs.length - 1 && adjacencyIndicators[idx] && (
                    <div className="relative pl-7 sm:pl-11 py-1 flex items-center justify-start pointer-events-none">
                      <div className="absolute left-[26px] top-0 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 hidden sm:block" />
                      
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold border relative z-10 ${
                          adjacencyIndicators[idx].type === "continuous"
                            ? "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            : adjacencyIndicators[idx].type === "gap"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : adjacencyIndicators[idx].type === "overlap"
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        }`}
                      >
                        <ArrowDown className="h-3 w-3 shrink-0" />
                        <span>{adjacencyIndicators[idx].message}</span>
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={addSlab}
                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-5 rounded-xl font-bold text-xs"
              >
                <Plus className="h-4 w-4" /> Add Next Tier
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={suggestWithGemini}
                disabled={isLoadingGemini}
                className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 py-5 rounded-xl font-bold text-xs"
              >
                {isLoadingGemini ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Getting suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 shrink-0" />
                    Suggest with Gemini AI
                  </>
                )}
              </Button>
            </div>
            
            <Button
              onClick={saveConfiguration}
              disabled={!!errorMsg || isSaving}
              className="bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-500 text-white flex items-center gap-1.5 shadow-md py-5 rounded-xl font-bold text-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Publishing Slab Data...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 shrink-0" />
                  Publish Commission Matrix
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <SlabHistory history={history} />
    </div>
  );
}