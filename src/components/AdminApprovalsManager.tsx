"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserCheck,
  AlertCircle,
  Edit2,
  CheckCircle2,
  Lock,
  Calendar,
  DollarSign,
  TrendingUp,
  FileCheck,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PendingRecord {
  carModelId: string;
  carModelName: string;
  carVariant: string;
  quantity: number;
  logId: string;
}

interface PendingGroup {
  userId: string;
  userName: string;
  userEmail: string;
  month: number;
  year: number;
  records: PendingRecord[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminApprovalsManager() {
  const [submissions, setSubmissions] = useState<PendingGroup[]>([]);
  const [slabs, setSlabs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  
  // Track resolved cards locally to display transition states and approval timestamps
  const [resolvedCards, setResolvedCards] = useState<Record<string, { status: "APPROVED" | "REJECTED"; timestamp: string }>>({});

  const loadSlabs = async () => {
    try {
      const res = await fetch("/api/admin/slabs");
      if (res.ok) {
        const data = await res.json();
        const slabData = Array.isArray(data) ? data : data.slabs || [];
        setSlabs(slabData);
      }
    } catch (err) {
      console.error("Failed to load active slabs", err);
    }
  };

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/approvals");
      if (!res.ok) throw new Error("Failed to load submissions.");
      const data = await res.json();
      setSubmissions(data);
      
      // Initialize edited quantities
      const initialQty: Record<string, number> = {};
      data.forEach((group: PendingGroup) => {
        group.records.forEach((rec) => {
          initialQty[`${group.userId}-${group.month}-${group.year}-${rec.carModelId}`] = rec.quantity;
        });
      });
      setEditedQuantities(initialQty);
    } catch (err: any) {
      toast.error(err.message || "Failed to load verification logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    // Clear resolved cards cache on manual refresh to sync with DB
    setResolvedCards({});
    await loadSlabs();
    await loadSubmissions();
    toast.success("Approvals queue synchronized.");
  };

  useEffect(() => {
    loadSlabs();
    loadSubmissions();
  }, []);

  const handleQtyChange = (userId: string, month: number, year: number, carModelId: string, val: number) => {
    const key = `${userId}-${month}-${year}-${carModelId}`;
    setEditedQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, val)
    }));
  };

  const handleAction = async (group: PendingGroup, action: "APPROVE" | "REJECT") => {
    const cardKey = `${group.userId}-${group.month}-${group.year}`;
    try {
      const updatedRecords = group.records.map(rec => {
        const key = `${group.userId}-${group.month}-${group.year}-${rec.carModelId}`;
        return {
          carModelId: rec.carModelId,
          quantity: editedQuantities[key] ?? rec.quantity
        };
      });

      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: group.userId,
          month: group.month,
          year: group.year,
          action,
          records: action === "APPROVE" ? updatedRecords : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");

      // Calculate timestamp
      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const timestamp = `${timeStr} on ${dateStr}`;

      toast.success(action === "APPROVE" ? "Submission verified & approved." : "Submission rejected.");
      
      // Update local resolved status instead of immediate deletion to animate the "locked state"
      setResolvedCards(prev => ({
        ...prev,
        [cardKey]: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          timestamp
        }
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to submit verification status.");
    }
  };

  const toggleExpand = (key: string) => {
    // Prevent expanding if already resolved
    if (resolvedCards[key]) return;
    setExpandedCard(prev => (prev === key ? null : key));
  };

  // Calculate dynamic incentive payout from active slabs matrix
  const getEstimatedPayout = (totalUnits: number) => {
    if (slabs.length === 0) return 0;
    const sortedSlabs = [...slabs].sort((a, b) => a.minUnits - b.minUnits);
    const currentTier = sortedSlabs.find(slab => {
      if (slab.maxUnits === null) return totalUnits >= slab.minUnits;
      return totalUnits >= slab.minUnits && totalUnits <= slab.maxUnits;
    }) || null;
    const rate = currentTier ? currentTier.incentivePerCar : 0;
    return totalUnits * rate;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <RefreshCw className="h-9 w-9 animate-spin text-red-500 mb-3" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Compiling Audit Logs...</span>
      </div>
    );
  }

  // Filter pending logs to compute final list, keeping resolved ones visible as locked cards
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white tracking-widest uppercase font-heading">
            Verification Approvals Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review sales officer performance, adjust volume, and lock ledgers for payroll disbursements.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="border-white/[0.08] text-slate-300 hover:text-white bg-slate-950/40 font-black text-xs uppercase tracking-wider rounded-xl py-4 active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Queue
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card className="border-white/[0.06] bg-slate-950/40 backdrop-blur-md shadow-2xl">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-sm font-black text-white tracking-wider uppercase mb-1">
              Ledger Clear
            </h3>
            <p className="text-xs text-slate-500 max-w-[320px] leading-relaxed">
              All monthly officer logs are successfully locked. No records pending audit verification.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((group) => {
            const cardKey = `${group.userId}-${group.month}-${group.year}`;
            const resolvedInfo = resolvedCards[cardKey];
            const isExpanded = expandedCard === cardKey && !resolvedInfo;
            const periodLabel = `${MONTH_NAMES[group.month - 1]} ${group.year}`;
            
            // Get total units including live edits
            const totalUnits = group.records.reduce((acc, rec) => {
              const key = `${group.userId}-${group.month}-${group.year}-${rec.carModelId}`;
              return acc + (editedQuantities[key] ?? rec.quantity);
            }, 0);

            const estimatedPayout = getEstimatedPayout(totalUnits);

            return (
              <Card
                key={cardKey}
                className={`border-white/[0.06] bg-slate-950/40 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300 ${
                  resolvedInfo?.status === "APPROVED"
                    ? "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.06)] bg-emerald-950/5"
                    : resolvedInfo?.status === "REJECTED"
                    ? "border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.06)] bg-red-950/5"
                    : "hover:border-white/[0.12]"
                }`}
              >
                {/* Header Section - Structured Hierarchy (Officer Name, Period, Units, Payout) */}
                <CardHeader
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none cursor-pointer ${
                    resolvedInfo ? "cursor-not-allowed opacity-90" : ""
                  }`}
                  onClick={() => toggleExpand(cardKey)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Gradient Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-indigo-700 flex items-center justify-center text-white shrink-0 font-black text-xs shadow-md">
                      {group.userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-black text-white font-heading uppercase tracking-wide truncate">
                          {group.userName}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-white/[0.05] text-slate-350 px-2 py-0.5 rounded-md font-mono">
                          <Calendar className="h-3 w-3 text-red-500" />
                          <span>{periodLabel}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate block font-mono">
                        {group.userEmail}
                      </span>
                    </div>
                  </div>

                  {/* Structured payout/volume indicators */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/[0.04] pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider leading-none mb-1">Volume Registered</span>
                      <span className="text-xs font-black font-mono text-slate-200 tabular-nums">
                        {totalUnits} units
                      </span>
                    </div>
                    
                    <div className="text-left md:text-right border-l border-white/[0.08] pl-5">
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider leading-none mb-1">Calculated Incentive</span>
                      <span className="text-xs font-black font-mono text-emerald-400 tabular-nums">
                        ₹{estimatedPayout.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-white/[0.08] pl-5 shrink-0">
                      {resolvedInfo ? (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          resolvedInfo.status === "APPROVED"
                            ? "bg-emerald-950/40 text-emerald-450 border-emerald-500/20"
                            : "bg-red-950/40 text-red-450 border-red-500/20"
                        }`}>
                          <Lock className="h-3 w-3 shrink-0" />
                          <span>{resolvedInfo.status}</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Transition to Locked / Resolved State (Trustworthy lock layout) */}
                {resolvedInfo && (
                  <div className="border-t border-white/[0.04] bg-white/[0.01] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-400 leading-none">
                        Ledger locked. Action logged on Toyota secure nodes.
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wide">
                      AUDIT COMPLETE: {resolvedInfo.timestamp}
                    </div>
                  </div>
                )}

                {/* Interactive Configurator Area */}
                {isExpanded && !resolvedInfo && (
                  <CardContent className="px-5 pb-5 pt-0 border-t border-white/[0.04] bg-[#0c0c14]/40">
                    <div className="py-4 space-y-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">
                          Audit Quantities By Model
                        </span>
                      </div>

                      <div className="divide-y divide-white/[0.04] bg-slate-950/30 border border-white/[0.04] rounded-xl px-4">
                        {group.records.map((rec) => {
                          const key = `${group.userId}-${group.month}-${group.year}-${rec.carModelId}`;
                          const qty = editedQuantities[key] ?? rec.quantity;

                          return (
                            <div key={rec.carModelId} className="py-3.5 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <span className="text-xs font-extrabold text-[#eeeff7] uppercase tracking-wide block truncate">
                                  {rec.carModelName}
                                </span>
                                <span className="text-[10px] text-slate-450 font-bold block tracking-wider font-mono">
                                  {rec.carVariant}
                                </span>
                              </div>

                              {/* Tactile plus/minus controls */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleQtyChange(group.userId, group.month, group.year, rec.carModelId, qty - 1)}
                                  disabled={qty <= 0}
                                  className="w-7 h-7 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg border border-white/[0.04] hover:border-red-500/20 active:scale-90 transition-all font-mono font-bold text-xs"
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  value={qty}
                                  onChange={(e) => handleQtyChange(group.userId, group.month, group.year, rec.carModelId, parseInt(e.target.value, 10) || 0)}
                                  className="w-12 h-7 p-0 text-center font-mono font-black text-xs bg-slate-900 border-white/[0.08] focus:border-red-500 tabular-nums"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleQtyChange(group.userId, group.month, group.year, rec.carModelId, qty + 1)}
                                  className="w-7 h-7 bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg border border-white/[0.04] hover:border-indigo-500/20 active:scale-90 transition-all font-mono font-bold text-xs"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Verification CTA Buttons */}
                      <div className="pt-2 flex items-center justify-end gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => handleAction(group, "REJECT")}
                          className="text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-450 border border-transparent hover:border-red-500/20 rounded-xl px-4 py-4 active:scale-95 transition-all"
                        >
                          <X className="h-4 w-4 mr-1.5 shrink-0" /> Reject Sheet
                        </Button>
                        
                        <Button
                          onClick={() => handleAction(group, "APPROVE")}
                          className="bg-red-650 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest px-5 py-4 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 border border-red-500/20"
                        >
                          <FileCheck className="h-4 w-4 text-white shrink-0" /> Verify & Authorize Payout
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
