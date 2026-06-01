"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Calendar, User, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface SlabHistoryLog {
  id: string;
  snapshot: any; // Can be stringified JSON or parsed array of SlabInput
  changedBy: string;
  createdAt: string;
}

interface SlabHistoryProps {
  history: SlabHistoryLog[];
  isLoading?: boolean;
}

export default function SlabHistory({ history, isLoading = false }: SlabHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const parseSnapshot = (snapshot: any) => {
    try {
      if (typeof snapshot === "string") {
        return JSON.parse(snapshot);
      }
      if (Array.isArray(snapshot)) {
        return snapshot;
      }
      return [];
    } catch (e) {
      console.error("Failed to parse history snapshot", e);
      return [];
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto border-border bg-card/40 backdrop-blur-md shadow-2xl mt-6">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 w-32 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-border shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden mt-6 relative">
      <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <History className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase font-heading">
              Audit Logs & Slab History
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review chronological changes committed to the live incentive parameters.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 dark:border-white/[0.06] rounded-2xl bg-slate-50 dark:bg-white/[0.01] flex flex-col items-center justify-center">
            <History className="h-10 w-10 stroke-1 mb-3 text-slate-400 dark:text-slate-650" />
            <span className="text-xs font-black uppercase tracking-wider">No Configuration Logs Available</span>
            <p className="text-[10px] text-slate-500 mt-1">Publish changes above to create the initial snapshot version.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative border-l border-slate-200 dark:border-white/[0.08] pl-4 sm:pl-6 space-y-4 ml-3"
          >
            {history.map((log) => {
              const slabs = parseSnapshot(log.snapshot);
              const isExpanded = expandedId === log.id;
              const formattedDate = new Date(log.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <motion.div
                  key={log.id}
                  variants={itemVariants}
                  className="relative group"
                >
                  {/* Timeline node */}
                  <span className="absolute -left-[21px] sm:-left-[29px] top-4 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-950 border-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] group-hover:scale-125 transition-all duration-200" />

                  <div className="bg-card border border-border hover:border-slate-300 dark:hover:border-white/[0.1] rounded-xl hover:shadow-[0_0_20px_rgba(200,16,46,0.04)] transition-all duration-200 overflow-hidden">
                    {/* Header bar */}
                    <div
                      onClick={() => toggleExpand(log.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3.5 w-3.5 text-red-550 shrink-0" />
                          <span className="font-bold text-slate-700 dark:text-slate-200 font-mono tabular-nums">
                            {formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <User className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[160px] font-medium text-slate-700 dark:text-slate-350" title={log.changedBy}>
                            {log.changedBy}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-red-550 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-mono tabular-nums">
                          {slabs.length} {slabs.length === 1 ? "Slab" : "Slabs"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 hover:text-slate-805 dark:hover:text-white transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 hover:text-slate-805 dark:hover:text-white transition-colors" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Preview */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#080810]/60 px-4 py-4"
                        >
                          <div className="flex items-center gap-1.5 mb-3">
                            <Layers className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 leading-none">
                              Snapshot Preview
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {slabs.map((slab: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-white dark:bg-[#10101a] border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg text-xs"
                              >
                                <span className="font-extrabold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                                  {slab.maxUnits === null
                                    ? `${slab.minUnits}+`
                                    : `${slab.minUnits}–${slab.maxUnits}`}{" "}
                                  units
                                </span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                  ₹{Number(slab.incentivePerCar).toLocaleString("en-IN")}/car
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
