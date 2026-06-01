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
  X,
  Check,
  Award,
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

interface TierTheme {
  label: string;
  bg: string;
  border: string;
  glow: string;
  accent: string;
  iconBg: string;
  icon: string;
  color: string;
}

const TIER_THEMES: TierTheme[] = [
  {
    label: "Bronze Tier",
    bg: "bg-[#fdfbf7] dark:bg-[#120d08] hover:bg-[#faf4ec] dark:hover:bg-[#18110b]",
    border: "border-[#cd7f32]/30 dark:border-[#cd7f32]/20 hover:border-[#cd7f32]/50 dark:hover:border-[#cd7f32]/40",
    glow: "shadow-[0_0_20px_rgba(205,127,50,0.03)] dark:shadow-[0_0_20px_rgba(205,127,50,0.05)]",
    accent: "bg-[#cd7f32]",
    iconBg: "bg-[#cd7f32]/10 border-[#cd7f32]/30",
    icon: "🥉",
    color: "text-[#cd7f32]"
  },
  {
    label: "Silver Tier",
    bg: "bg-[#f7f9fb] dark:bg-[#0c1015] hover:bg-[#eef2f6] dark:hover:bg-[#11171f]",
    border: "border-[#a8b8c8]/30 dark:border-[#a8b8c8]/20 hover:border-[#a8b8c8]/50 dark:hover:border-[#a8b8c8]/40",
    glow: "shadow-[0_0_20px_rgba(168,184,200,0.03)] dark:shadow-[0_0_20px_rgba(168,184,200,0.05)]",
    accent: "bg-[#a8b8c8]",
    iconBg: "bg-[#a8b8c8]/10 border-[#a8b8c8]/30",
    icon: "🥈",
    color: "text-[#a8b8c8]"
  },
  {
    label: "Gold Tier",
    bg: "bg-[#fdfdf7] dark:bg-[#141208] hover:bg-[#fafae9] dark:hover:bg-[#1a170b]",
    border: "border-[#d4a017]/30 dark:border-[#d4a017]/20 hover:border-[#d4a017]/50 dark:hover:border-[#d4a017]/40",
    glow: "shadow-[0_0_20px_rgba(212,160,23,0.03)] dark:shadow-[0_0_20px_rgba(212,160,23,0.05)]",
    accent: "bg-[#d4a017]",
    iconBg: "bg-[#d4a017]/10 border-[#d4a017]/30",
    icon: "🥇",
    color: "text-[#d4a017]"
  },
  {
    label: "Platinum Tier",
    bg: "bg-[#f7fcfd] dark:bg-[#081315] hover:bg-[#edf9fa] dark:hover:bg-[#0b1b1e]",
    border: "border-[#7dd8e6]/30 dark:border-[#7dd8e6]/20 hover:border-[#7dd8e6]/50 dark:hover:border-[#7dd8e6]/40",
    glow: "shadow-[0_0_20px_rgba(125,216,230,0.03)] dark:shadow-[0_0_20px_rgba(125,216,230,0.05)]",
    accent: "bg-[#7dd8e6]",
    iconBg: "bg-[#7dd8e6]/10 border-[#7dd8e6]/30",
    icon: "💎",
    color: "text-[#7dd8e6]"
  },
  {
    label: "Diamond Tier",
    bg: "bg-[#faf7fd] dark:bg-[#110c18] hover:bg-[#f3edfa] dark:hover:bg-[#181123]",
    border: "border-[#b388ff]/30 dark:border-[#b388ff]/20 hover:border-[#b388ff]/50 dark:hover:border-[#b388ff]/40",
    glow: "shadow-[0_0_20px_rgba(179,136,255,0.03)] dark:shadow-[0_0_20px_rgba(179,136,255,0.05)]",
    accent: "bg-[#b388ff]",
    iconBg: "bg-[#b388ff]/10 border-[#b388ff]/30",
    icon: "👑",
    color: "text-[#b388ff]"
  },
];

export default function VisualSlabBuilder() {
  const [slabs, setSlabs] = useState<SlabInput[]>([
    { minUnits: 1, maxUnits: 3, incentivePerCar: 1000 },
  ]);
  const [history, setHistory] = useState<SlabHistoryLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

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

  useEffect(() => {
    const result = validateIncentiveSlabs(slabs);
    setErrorMsg(result.isValid ? null : result.error || "Validation error");
    if (result.isValid) setSuccessMsg(null);
  }, [slabs]);

  const invalidIndices = useMemo(() => {
    const invalids = new Set<number>();
    for (let i = 0; i < slabs.length; i++) {
      const current = slabs[i];
      if (current.minUnits < 0 || current.incentivePerCar < 0 || (current.maxUnits !== null && current.maxUnits < 0)) {
        invalids.add(i);
      }
      if (i === 0 && current.minUnits !== 1) {
        invalids.add(i);
      }
      if (current.maxUnits !== null && current.maxUnits < current.minUnits) {
        invalids.add(i);
      }
      if (i > 0) {
        const prev = slabs[i - 1];
        if (prev.maxUnits === null) {
          invalids.add(i);
        } else if (current.minUnits !== prev.maxUnits + 1) {
          invalids.add(i);
          invalids.add(i - 1);
        }
      }
    }
    return invalids;
  }, [slabs]);

  const updateSlab = useCallback(
    (index: number, field: keyof SlabInput, value: number | null) => {
      setSlabs((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
      setSuccessMsg(null);
      setPublishState("idle");
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
    setPublishState("idle");
  }, []);

  const removeSlab = useCallback((index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
    setSuccessMsg(null);
    setPublishState("idle");
  }, []);

  const saveConfiguration = async () => {
    const validation = validateIncentiveSlabs(slabs);
    if (!validation.isValid) {
      setPublishState("error");
      return;
    }

    setIsSaving(true);
    setPublishState("loading");
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
      setPublishState("success");
      await loadConfigAndHistory();
      
      setTimeout(() => {
        setPublishState("idle");
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save slab configuration.";
      toast.error(msg);
      setErrorMsg(msg);
      setPublishState("error");
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
      
      let suggestionsList: any[] = [];
      if (data.success && data.suggestions) {
        if (Array.isArray(data.suggestions)) {
          suggestionsList = data.suggestions;
        } else if (typeof data.suggestions === 'object' && data.suggestions !== null) {
          if (Array.isArray(data.suggestions.suggestions)) {
            suggestionsList = data.suggestions.suggestions;
          } else if (Array.isArray(data.suggestions.strategies)) {
            suggestionsList = data.suggestions.strategies;
          } else {
            const keys = Object.keys(data.suggestions);
            for (const key of keys) {
              if (Array.isArray(data.suggestions[key])) {
                suggestionsList = data.suggestions[key];
                break;
              }
            }
            if (suggestionsList.length === 0 && (data.suggestions.strategy || data.suggestions.slabs)) {
              suggestionsList = [data.suggestions];
            }
          }
        }
      }
      
      if (!suggestionsList || suggestionsList.length === 0) {
        throw new Error("Invalid suggestions format from server.");
      }
      
      setAiSuggestions(suggestionsList);
      setShowSuggestionsModal(true);
      toast.success("AI has generated optimal commission slab configurations!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate suggestions";
      toast.error(msg);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const applyAiSuggestion = useCallback((suggestion: any) => {
    if (!suggestion || !Array.isArray(suggestion.slabs)) return;
    
    const mappedSlabs = suggestion.slabs.map((s: any) => ({
      minUnits: Number(s.minUnits),
      maxUnits: s.maxUnits !== null && s.maxUnits !== undefined ? Number(s.maxUnits) : null,
      incentivePerCar: Number(s.incentivePerCar ?? s.incentivePerUnit ?? s.incentive ?? s.rate ?? 0),
    }));
    
    setSlabs(mappedSlabs);
    setShowSuggestionsModal(false);
    toast.success(`Applied Strategy: ${suggestion.strategy || "AI Configuration"}`);
  }, []);

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
          message: `Continuous transition to Tier ${i + 2}`,
        });
      } else if (next.minUnits > curr.maxUnits + 1) {
        indicators.push({
          type: "gap",
          message: `Gap of ${next.minUnits - curr.maxUnits - 1} units between ${curr.maxUnits} and ${next.minUnits}`,
        });
      } else {
        indicators.push({
          type: "overlap",
          message: `Overlap of ${curr.maxUnits - next.minUnits + 1} units between ${next.minUnits} and ${curr.maxUnits}`,
        });
      }
    }
    return indicators;
  }, [slabs]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto border-border bg-card/40 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white heading-font">
            DYNAMIC SLAB MATRIX CONFIGURATION
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Retrieving active parameter configuration...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
          <div className="h-10 w-44 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-3xl mx-auto border-border shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        <CardHeader className="pb-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase font-heading">
                Dynamic Tier Configuration Engine
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure incentive slabs for your dealership force. Connect rates sequentially. Overlaps are forbidden.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold uppercase tracking-wider block text-[10px] text-red-400">Rule Violation Detected</span>
                  <span className="text-xs leading-relaxed">{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-xs font-semibold">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative pl-0 sm:pl-4 space-y-4">
            <div className="absolute left-[26px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-red-500/20 via-slate-700/20 to-indigo-500/20 hidden sm:block pointer-events-none" />

            {slabs.map((slab, idx) => {
              const theme = TIER_THEMES[Math.min(idx, TIER_THEMES.length - 1)];
              const isInvalid = invalidIndices.has(idx);

              return (
                <React.Fragment key={`slab-fragment-${idx}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl border transition-all duration-300 shadow-lg ${theme.bg} ${theme.border} ${theme.glow} ${
                      isInvalid ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)] bg-red-950/10" : ""
                    }`}
                  >
                    <div className={`absolute sm:static -top-2.5 -left-2 sm:-left-0 shrink-0 w-8 h-8 rounded-lg ${theme.iconBg} border shadow-inner flex items-center justify-center text-sm font-extrabold relative z-10 ${theme.color}`}>
                      <span className="sm:hidden text-xs">{idx + 1}</span>
                      <span className="hidden sm:inline">{theme.icon}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Min Units</label>
                        <div className="relative">
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
                            className="bg-white dark:bg-[#080810]/60 border-slate-200 dark:border-white/[0.08] focus:border-red-500 h-9 px-2 text-xs font-mono font-bold text-slate-800 dark:text-[#eeeff7] tabular-nums"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Max Units</label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="∞ (Open)"
                            value={slab.maxUnits === null ? "" : slab.maxUnits}
                            onChange={(e) => {
                              const text = e.target.value.trim().replace(/[^0-9]/g, "");
                              updateSlab(idx, "maxUnits", text === "" ? null : parseInt(text, 10));
                            }}
                            className="bg-white dark:bg-[#080810]/60 border-slate-200 dark:border-white/[0.08] focus:border-red-500 h-9 px-2 text-xs font-mono font-bold text-slate-800 dark:text-[#eeeff7] tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">₹ / Car Rate</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-emerald-600 dark:text-emerald-450 font-bold text-xs">₹</span>
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
                            className="bg-white dark:bg-[#080810]/80 border-slate-200 dark:border-white/[0.08] focus:border-red-500 h-9 pl-5 pr-2 text-xs font-mono font-black text-emerald-600 dark:text-emerald-450 tabular-nums shadow-[0_0_10px_rgba(16,185,129,0.02)]"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlab(idx)}
                      disabled={slabs.length <= 1}
                      className="hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-all self-end sm:self-center shrink-0 w-9 h-9 rounded-xl active:scale-95 disabled:opacity-30 border border-transparent hover:border-red-500/20"
                      aria-label={`Remove slab tier ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>

                  {idx < slabs.length - 1 && adjacencyIndicators[idx] && (
                    <div className="relative pl-7 sm:pl-11 py-1 flex items-center justify-start pointer-events-none">
                      <div className="absolute left-[26px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-slate-700/20 to-slate-700/20 hidden sm:block" />
                      
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border relative z-10 tabular-nums shadow-lg backdrop-blur-sm ${
                          adjacencyIndicators[idx].type === "continuous"
                            ? "bg-slate-900/60 text-slate-400 border-white/[0.04]"
                            : adjacencyIndicators[idx].type === "gap"
                            ? "bg-amber-950/30 text-amber-400 border-amber-800/40 shadow-[0_0_12px_rgba(245,158,11,0.06)]"
                            : adjacencyIndicators[idx].type === "overlap"
                            ? "bg-red-950/30 text-red-400 border-red-800/40 shadow-[0_0_12px_rgba(239,68,68,0.06)]"
                            : "bg-purple-950/30 text-purple-400 border-purple-800/40"
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

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-5 border-t border-white/[0.06]">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={addSlab}
                className="flex items-center gap-2 text-slate-350 border-white/[0.08] hover:bg-white/5 py-5 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Next Tier
              </Button>
              
              <div className="relative rounded-xl overflow-hidden p-[1px] bg-gradient-to-r from-amber-500 via-indigo-500 to-red-500 animate-shimmer shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={suggestWithGemini}
                  disabled={isLoadingGemini}
                  className="w-full flex items-center justify-center gap-2 text-amber-400 bg-slate-950 border-transparent hover:bg-slate-900 py-5 rounded-[11px] font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isLoadingGemini ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0 text-amber-400" />
                      Incentivizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-amber-400" />
                      Gemini AI Suggest
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              onClick={saveConfiguration}
              disabled={!!errorMsg || isSaving}
              className={`flex items-center justify-center gap-2 shadow-lg py-5 px-6 rounded-xl font-black text-xs uppercase tracking-widest tracking-wider active:scale-95 transition-all duration-300 text-white ${
                publishState === "success"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
                  : publishState === "error"
                  ? "bg-red-700 hover:bg-red-600"
                  : "bg-red-650 hover:bg-red-600 shadow-red-900/10"
              }`}
            >
              {publishState === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Publishing Data...
                </>
              ) : publishState === "success" ? (
                <>
                  <Check className="h-4 w-4 shrink-0 animate-bounce" />
                  Published Successfully
                </>
              ) : publishState === "error" ? (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Validation Failed
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 shrink-0" />
                  Publish Matrix
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showSuggestionsModal && aiSuggestions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuggestionsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative bg-[#10101a] rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto border border-white/[0.06] focus:outline-none"
            >
              <button
                onClick={() => setShowSuggestionsModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#eeeff7] hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Close suggestions modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase font-heading">
                    Toyota AI Slab Consultant
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Speculative incentive tiers optimized for conversion volume and target gross margins.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {aiSuggestions.map((suggestion: any, index: number) => (
                  <div
                    key={index}
                    className="relative group bg-[#161624]/60 border border-white/[0.04] hover:border-white/[0.1] rounded-2xl p-5 transition-all duration-300 shadow-md"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                            Strategy {index + 1}
                          </span>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider font-heading">
                            {suggestion.strategy || suggestion.description || "AI Strategy Option"}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {suggestion.rationale}
                        </p>
                      </div>

                      <Button
                        onClick={() => applyAiSuggestion(suggestion)}
                        className="bg-red-650 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-4 h-auto rounded-xl flex items-center gap-1 shrink-0 self-end sm:self-start shadow-sm active:scale-95 transition-all"
                      >
                        <Check className="h-3 w-3 mr-0.5 shrink-0 text-white" />
                        Apply Strategy
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2.5 relative z-10">
                      {suggestion.slabs.map((slab: any, idx: number) => {
                        const rateVal = Number(slab.incentivePerCar ?? slab.incentivePerUnit ?? slab.incentive ?? slab.rate ?? 0);
                        const label = slab.maxUnits === null || slab.maxUnits === undefined || Number(slab.maxUnits) === 0
                          ? `${slab.minUnits}+ cars`
                          : `${slab.minUnits}–${slab.maxUnits} cars`;
                        return (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#080810] border border-white/[0.04] rounded-xl text-[10px] font-bold text-slate-350"
                          >
                            <span className="font-mono tabular-nums">{label}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="font-black text-emerald-400 font-mono tabular-nums">
                              ₹{rateVal.toLocaleString("en-IN")}/car
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setShowSuggestionsModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/[0.06] font-black text-xs uppercase tracking-wider px-5 py-4 rounded-xl active:scale-95 transition-all"
                >
                  Close Panel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SlabHistory history={history} />
    </div>
  );
}