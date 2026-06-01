"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  IndianRupee,
  Target,
  Loader2,
  CheckCircle2,
  Plus,
  Minus,
  Edit2,
  Check,
  Calendar,
  TrendingUp,
  Layers,
  BarChart3,
  FileDown,
  ChevronRight,
  TrendingDown,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { calculatePayout } from "@/lib/calc";
import IncentiveChart from "@/components/IncentiveChart";
import ConfirmDialog from "@/components/ConfirmDialog";

/* ──── Type Definitions ──── */
interface CarModel {
  id: string;
  modelName: string;
  variant: string;
  isActive: boolean;
}

interface IncentiveSlab {
  id: string;
  minUnits: number;
  maxUnits: number | null;
  incentivePerCar: number;
}

/* ──── Constants ──── */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TIER_BADGES = [
  { label: "Bronze", icon: "🥉", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/10 border-amber-500/20" },
  { label: "Silver", icon: "🥈", color: "text-slate-400 dark:text-slate-300", bg: "bg-slate-500/10 border-slate-500/20" },
  { label: "Gold", icon: "🥇", color: "text-yellow-500 dark:text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { label: "Platinum", icon: "💎", color: "text-indigo-400 dark:text-indigo-300", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "Diamond", icon: "👑", color: "text-primary dark:text-primary", bg: "bg-primary/10 border-primary/20" },
];

const TIER_COLORS = [
  "#cd7f32", // Bronze
  "#a8b8c8", // Silver
  "#d4a017", // Gold
  "#7dd8e6", // Platinum
  "#c8102e", // Diamond
];

const getCarImage = (modelName: string) => {
  const name = modelName.toLowerCase();
  if (name.includes("fortuner")) return "/fortuner.png";
  if (name.includes("innova")) return "/innova.png";
  if (name.includes("hyryder")) return "/hyryder.png";
  if (name.includes("vellfire")) return "/vellfire.png";
  if (name.includes("glanza")) return "/glanza.png";
  if (name.includes("camry")) return "/camry.png";
  return "/camry.png";
};

/* ──── Helper: Animated Number Counter with Tabular numerals ──── */
const AnimatedNumber = React.memo(function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;
    if (from === to) return;

    const duration = 450;
    const steps = 24;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 4); // Cubic-bezier ease-out fallback
      setDisplay(Math.round(from + (to - from) * eased));
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(to);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums font-mono">
      {prefix}
      {display.toLocaleString("en-IN")}
    </span>
  );
});

/* ──── Helper: Premium Donut Chart with Hover Slice Expansion ──── */
const PayoutDonutChart = React.memo(function PayoutDonutChart({
  slices,
  onHoverSlice,
}: {
  slices: { label: string; value: number; color: string }[];
  onHoverSlice?: (index: number | null) => void;
}) {
  const total = useMemo(() => slices.reduce((s, sl) => s + sl.value, 0), [slices]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const segments = useMemo(() => {
    let accumulated = 0;
    return slices.map((sl) => {
      const pct = total > 0 ? (sl.value / total) * 100 : 0;
      const start = accumulated;
      accumulated += pct;
      return { ...sl, pct, start };
    });
  }, [slices, total]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-500">
        <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] flex items-center justify-center mb-2.5">
          <IndianRupee className="h-4.5 w-4.5 text-slate-500" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No earnings logged</span>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-24 h-24 shrink-0 select-none">
        <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
          {segments.map((seg, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <motion.circle
                key={i}
                cx="48"
                cy="48"
                r="40"
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? "11" : "8"}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference - (seg.pct / 100) * circumference,
                }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                strokeDashoffset={circumference}
                style={{
                  transformOrigin: "center",
                  transform: `rotate(${(seg.start / 100) * 360}deg)`,
                  filter: isHovered ? `drop-shadow(0 0 4px ${seg.color}66)` : "none",
                  cursor: "pointer",
                }}
                strokeLinecap="round"
                onMouseEnter={() => {
                  setHoveredIdx(i);
                  if (onHoverSlice) onHoverSlice(i);
                }}
                onMouseLeave={() => {
                  setHoveredIdx(null);
                  if (onHoverSlice) onHoverSlice(null);
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[7px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">TOTAL</span>
          <span className="text-xs font-black text-white font-mono leading-none mt-1 tabular-nums">
            ₹{(hoveredIdx !== null ? slices[hoveredIdx].value : total).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 w-full">
        {segments.filter((s) => s.value > 0).map((seg, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              className={`flex items-center justify-between text-[10px] gap-2 p-1.5 rounded-lg transition-colors duration-250 ${
                isHovered ? "bg-white/[0.03]" : ""
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className={`truncate font-semibold transition-colors ${
                  isHovered ? "text-white" : "text-[#85879b]"
                }`}>{seg.label.replace("Toyota ", "")}</span>
              </div>
              <span className={`font-mono font-black shrink-0 tabular-nums transition-colors ${
                isHovered ? "text-emerald-400" : "text-slate-200"
              }`}>₹{seg.value.toLocaleString("en-IN")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ──── Helper: Mini Progress Tracker to next Slab Inside Cards ──── */
function SlabProgressMeter({ qty, slabs }: { qty: number; slabs: IncentiveSlab[] }) {
  if (qty === 0 || slabs.length === 0) return null;

  const currentSlabIdx = slabs.findIndex((s) => {
    if (s.maxUnits === null) return qty >= s.minUnits;
    return qty >= s.minUnits && qty <= s.maxUnits;
  });

  const nextSlab = currentSlabIdx !== -1 && currentSlabIdx < slabs.length - 1 ? slabs[currentSlabIdx + 1] : null;
  if (!nextSlab) return null;

  const prevThreshold = currentSlabIdx !== -1 ? slabs[currentSlabIdx].maxUnits || slabs[currentSlabIdx].minUnits : 0;
  const currentProgress = qty - prevThreshold;
  const nextTarget = nextSlab.minUnits - prevThreshold;
  const pct = Math.min(100, Math.max(0, (currentProgress / nextTarget) * 100));

  return (
    <div className="mt-2 space-y-1 select-none">
      <div className="flex items-center justify-between text-[8px] font-extrabold uppercase text-slate-500">
        <span>Slab Progress:</span>
        <span className="text-[#85879b]">{nextSlab.minUnits - qty} units to {TIER_BADGES[currentSlabIdx + 1]?.label}</span>
      </div>
      <div className="h-1 rounded-full bg-slate-950 overflow-hidden border border-white/[0.03]">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-rose-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

/* ──── Main Component ──── */
interface SalesDashboardProps {
  userId: string;
}

export default function SalesDashboard({ userId }: SalesDashboardProps) {
  const [cars, setCars] = useState<CarModel[]>([]);
  const [slabs, setSlabs] = useState<IncentiveSlab[]>([]);
  const [salesMap, setSalesMap] = useState<Record<string, number>>({});
  const [savedSalesMap, setSavedSalesMap] = useState<Record<string, number>>({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<{ month: number; year: number } | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string>("DRAFT");

  // What-If Simulator states
  const [whatIfUnits, setWhatIfUnits] = useState(0);
  const [isWhatIfExpanded, setIsWhatIfExpanded] = useState(false);

  // Floating floater arrays & card flash maps
  const [cardEffects, setCardEffects] = useState<Record<string, { floaters: { id: number }[]; flash: boolean }>>({});

  // Active target milestone target state
  const [targetGoal, setTargetGoal] = useState(50000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("50000");

  const [officerName, setOfficerName] = useState("Sales Officer");

  const isDirty = useMemo(() => {
    const allKeys = new Set([...Object.keys(salesMap), ...Object.keys(savedSalesMap)]);
    for (const key of allKeys) {
      const q1 = salesMap[key] || 0;
      const q2 = savedSalesMap[key] || 0;
      if (q1 !== q2) return true;
    }
    return false;
  }, [salesMap, savedSalesMap]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  // Fetch Dashboard config
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sales?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to load dashboard data.");
      const data = await res.json();
      setCars(data.cars || []);
      setSlabs(data.slabs || []);

      // Pull active officer username from session helper
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user?.name) {
          setOfficerName(userData.user.name);
        }
      }

      const map: Record<string, number> = {};
      if (data.savedRecords) {
        for (const rec of data.savedRecords as { carModelId: string; quantity: number }[]) {
          map[rec.carModelId] = rec.quantity;
        }
      }
      setSalesMap(map);
      setSavedSalesMap(map);

      let status = "DRAFT";
      if (data.savedRecords && data.savedRecords.length > 0) {
        status = data.savedRecords[0].status || "PENDING";
      }
      setSubmissionStatus(status);
    } catch {
      toast.error("Failed to load dashboard configuration.");
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePeriodChange = (newMonth: number, newYear: number) => {
    if (isDirty) {
      setPendingPeriod({ month: newMonth, year: newYear });
    } else {
      setMonth(newMonth);
      setYear(newYear);
    }
  };

  // Steppers volume changes
  const handleQtyChange = (carId: string, qty: number) => {
    if (submissionStatus === "APPROVED") return;
    if (qty > 1000) {
      toast.warning("Sales volume per model is capped at 1,000 units per month.");
      setSalesMap((prev) => ({ ...prev, [carId]: 1000 }));
      return;
    }
    setSalesMap((prev) => ({ ...prev, [carId]: Math.max(0, Math.floor(qty)) }));
  };

  const handleIncrement = (carId: string) => {
    if (submissionStatus === "APPROVED") return;
    const currentQty = salesMap[carId] || 0;
    if (currentQty >= 1000) {
      toast.warning("Sales volume per model is capped at 1,000 units.");
      return;
    }
    setSalesMap((prev) => ({ ...prev, [carId]: currentQty + 1 }));

    // Trigger visual floater & card flash indicators
    const newId = Date.now();
    setCardEffects((prev) => {
      const current = prev[carId] || { floaters: [], flash: false };
      return {
        ...prev,
        [carId]: {
          floaters: [...current.floaters, { id: newId }],
          flash: true,
        },
      };
    });
    setTimeout(() => {
      setCardEffects((prev) => {
        const current = prev[carId] || { floaters: [], flash: false };
        return {
          ...prev,
          [carId]: { ...current, flash: false },
        };
      });
    }, 600);
  };

  const removeFloater = (carId: string, floaterId: number) => {
    setCardEffects((prev) => {
      const current = prev[carId] || { floaters: [], flash: false };
      return {
        ...prev,
        [carId]: {
          ...current,
          floaters: current.floaters.filter((f) => f.id !== floaterId),
        },
      };
    });
  };

  const handleDecrement = (carId: string) => {
    if (submissionStatus === "APPROVED") return;
    setSalesMap((prev) => ({
      ...prev,
      [carId]: Math.max(0, (prev[carId] || 0) - 1),
    }));
  };

  const handleSaveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      setTargetGoal(val);
      setIsEditingGoal(false);
    }
  };

  const handleSaveLogs = async () => {
    setIsSaving(true);
    try {
      const records = cars.map((car) => ({
        carModelId: car.id,
        quantity: salesMap[car.id] || 0,
      }));

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, records }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed.");
      }
      toast.success(`Sales records for ${MONTH_NAMES[month - 1]} ${year} submitted for verification successfully.`);
      setSavedSalesMap(salesMap);
      setSubmissionStatus("PENDING");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save records.");
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Download Map
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.setFillColor(16, 16, 26);
      doc.rect(0, 0, 210, 35, "F");
      
      doc.setTextColor(255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Nippon Toyota", 14, 16);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Smart Incentive Calculator — Executive Performance Statement", 14, 25);
      doc.text(`${MONTH_NAMES[month - 1]} ${year}`, 196, 16, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 196, 25, { align: "right" });

      const tableData = cars
        .filter((car) => (salesMap[car.id] || 0) > 0)
        .map((car) => {
          const qty = salesMap[car.id] || 0;
          const incentive = calculatePayout(qty, slabs).totalIncentive;
          return [
            car.modelName,
            car.variant.toUpperCase(),
            qty.toString(),
            `Rs. ${incentive.toLocaleString("en-IN")}`,
          ];
        });

      autoTable(doc, {
        startY: 42,
        head: [["Model Name", "Variant", "Units Sold", "Incentive Earned"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [200, 16, 46], fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          2: { halign: "center", fontStyle: "bold" },
          3: { halign: "right", fontStyle: "bold" },
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.setFillColor(244, 244, 246);
      doc.rect(14, finalY + 5, 182, 18, "F");
      doc.setTextColor(16, 16, 26);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Aggregate Incentive Payout:", 20, finalY + 16);
      doc.setFontSize(11);
      doc.text(`Rs. ${aggregatePayout.toLocaleString("en-IN")}`, 190, finalY + 16, { align: "right" });

      doc.setFontSize(6);
      doc.setTextColor(130, 130, 150);
      doc.text("This report is digitally signed and audited by Nippon Toyota SIC. Figures correspond to active incentive slabs.", 14, 285);

      doc.save(`NipponToyota_Incentive_${MONTH_NAMES[month - 1]}_${year}.pdf`);
      toast.success("PDF report exported successfully.");
    } catch {
      toast.error("Failed to generate PDF report.");
    }
  };

  // Computed metrics
  const aggregateMetrics = useMemo(() => {
    return cars.map((car) => {
      const qty = salesMap[car.id] || 0;
      const incentive = calculatePayout(qty, slabs).totalIncentive;
      return { car, qty, incentive };
    });
  }, [cars, salesMap, slabs]);

  const aggregateCarsSold = useMemo(
    () => aggregateMetrics.reduce((s, m) => s + m.qty, 0),
    [aggregateMetrics]
  );

  const aggregatePayout = useMemo(
    () => aggregateMetrics.reduce((s, m) => s + m.incentive, 0),
    [aggregateMetrics]
  );

  const activeSlabIndex = useMemo(() => {
    return slabs.findIndex((s) => {
      if (s.maxUnits === null) return aggregateCarsSold >= s.minUnits;
      return aggregateCarsSold >= s.minUnits && aggregateCarsSold <= s.maxUnits;
    });
  }, [slabs, aggregateCarsSold]);

  // Target Goal Percentage
  const goalPercentage = useMemo(
    () => Math.min(100, Math.round((aggregatePayout / targetGoal) * 100)),
    [aggregatePayout, targetGoal]
  );

  const goalCircleCircumference = 2 * Math.PI * 40;
  const goalCircleOffset = goalCircleCircumference - (goalPercentage / 100) * goalCircleCircumference;

  // Active target momentum chips calculation
  const targetMomentum = useMemo(() => {
    if (goalPercentage >= 100) return { label: "Target Smashed!", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" };
    if (goalPercentage >= 75) return { label: "Excellent Momentum", color: "text-primary bg-primary/10 border-primary/20" };
    if (goalPercentage >= 40) return { label: "On Track", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" };
    if (goalPercentage > 0) return { label: "Gaining Pace", color: "text-sky-400 bg-sky-500/10 border-sky-500/25" };
    return { label: "Awaiting Sales", color: "text-slate-500 bg-white/[0.02] border-white/[0.06]" };
  }, [goalPercentage]);

  // Slab Unlock Toast E2E Effect
  const prevSlabIndexRef = useRef(activeSlabIndex);
  const [flashIncentive, setFlashIncentive] = useState(false);

  useEffect(() => {
    if (activeSlabIndex > prevSlabIndexRef.current && prevSlabIndexRef.current !== -1) {
      const badge = TIER_BADGES[Math.min(activeSlabIndex, TIER_BADGES.length - 1)];
      const slab = slabs[activeSlabIndex];
      toast.success(`🎉 ${badge.label} Tier Unlocked!`, {
        description: `New rate: Rs. ${slab.incentivePerCar.toLocaleString("en-IN")}/car payout active.`,
        duration: 4000,
      });

      // Flash incentive card border glow
      setFlashIncentive(true);
      const timer = setTimeout(() => setFlashIncentive(false), 2000);
      return () => clearTimeout(timer);
    }
    prevSlabIndexRef.current = activeSlabIndex;
  }, [activeSlabIndex, slabs]);

  // Donut split values
  const donutSlices = useMemo(
    () =>
      aggregateMetrics
        .filter((m) => m.incentive > 0)
        .map((m, i) => ({
          label: `${m.car.modelName} ${m.car.variant}`,
          value: m.incentive,
          color: TIER_COLORS[i % TIER_COLORS.length],
        })),
    [aggregateMetrics]
  );

  // What-If Dynamic simulator projection payload
  const projectedPayout = useMemo(() => {
    const projectedTotalSold = aggregateCarsSold + whatIfUnits;
    return calculatePayout(projectedTotalSold, slabs).totalIncentive;
  }, [aggregateCarsSold, whatIfUnits, slabs]);

  const chartData = useMemo(() => {
    return aggregateMetrics
      .filter((m) => m.qty > 0)
      .map((m) => {
        // If What-If is active, divide whatIfUnits proportionally across models or add to first model
        return {
          name: `${m.car.modelName.replace("Toyota ", "")} ${m.car.variant.toUpperCase()}`,
          incentive: m.incentive,
          units: m.qty,
          projectedIncentive: m.incentive + (whatIfUnits > 0 ? (m.incentive / aggregatePayout) * (projectedPayout - aggregatePayout) : 0),
        };
      });
  }, [aggregateMetrics, whatIfUnits, aggregatePayout, projectedPayout]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 text-[#eeeff7]"
    >
      {/* Dynamic Header Greeting Zone */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div className="space-y-1">
          <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block leading-none">
            Nippon Sales Portal
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-heading text-white tracking-tight leading-none">
              Welcome back, <span className="text-primary">{officerName}</span>
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border leading-none shadow-md ${targetMomentum.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${goalPercentage >= 100 ? "bg-emerald-400" : "bg-primary animate-pulse"}`} />
              {targetMomentum.label}
            </span>
          </div>
        </div>

        {/* Month Selector Segment controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#10101a] border border-white/[0.06] rounded-xl px-3 py-2 shadow-xl ring-1 ring-white/[0.02] cursor-pointer">
            <Calendar className="h-4 w-4 text-primary" />
            <select
              value={month}
              onChange={(e) => handlePeriodChange(Number(e.target.value), year)}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1} className="bg-[#10101a] text-xs">
                  {name.slice(0, 3)}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => handlePeriodChange(month, Number(e.target.value))}
              className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer font-mono"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y} className="bg-[#10101a] text-xs">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            disabled={aggregateCarsSold === 0}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border-white/[0.06] hover:bg-white/[0.03] rounded-xl h-9 btn-press text-[#eeeff7]"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export Statement
          </Button>
        </div>
      </div>

      {/* Elite KPI metrics strip banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Estimated Incentive",
            value: <AnimatedNumber value={aggregatePayout} prefix="₹" />,
            icon: <IndianRupee className="h-4.5 w-4.5" />,
            color: "from-[#c8102e]/20 to-red-900/10 text-primary border-primary/10",
            sub: "Total accrued dynamic commission",
            flash: flashIncentive,
          },
          {
            label: "Total Cars Sold",
            value: <AnimatedNumber value={aggregateCarsSold} />,
            icon: <Car className="h-4.5 w-4.5" />,
            color: "from-sky-500/20 to-sky-700/10 text-sky-400 border-sky-500/10",
            sub: "Monthly vehicle quota metrics",
            // Segmented capacity dots progress cue
            progressCue: (
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-1.5 rounded-sm transition-all duration-300 ${
                      i < Math.min(10, Math.ceil((aggregateCarsSold / 30) * 10))
                        ? "bg-sky-400 shadow-[0_0_4px_rgba(56,189,248,0.4)]"
                        : "bg-white/[0.04]"
                    }`}
                  />
                ))}
              </div>
            ),
          },
          {
            label: "Active Variants",
            value: cars.length,
            icon: <Layers className="h-4.5 w-4.5" />,
            color: "from-purple-500/20 to-purple-700/10 text-purple-400 border-purple-500/10",
            sub: "Toyota active products configured",
          },
          {
            label: "Reporting Status",
            value: submissionStatus === "APPROVED" ? "APPROVED" : submissionStatus === "PENDING" ? "PENDING" : "DRAFT",
            icon: <CheckCircle2 className="h-4.5 w-4.5" />,
            color:
              submissionStatus === "APPROVED"
                ? "from-emerald-500/20 to-emerald-700/10 text-emerald-400 border-emerald-500/10"
                : submissionStatus === "PENDING"
                ? "from-amber-500/20 to-amber-700/10 text-amber-400 border-amber-500/10"
                : "from-slate-500/10 to-slate-700/10 text-slate-400 border-white/[0.04]",
            sub: "Workflow verification status",
          },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`bg-[#10101a] border transition-all duration-500 relative overflow-hidden shadow-2xl ${
                kpi.flash
                  ? "border-emerald-500 shadow-[0_0_25px_rgba(34,197,94,0.35)] scale-[1.02]"
                  : "border-white/[0.04] hover:border-primary/20"
              }`}
            >
              <CardContent className="p-5 flex flex-col justify-between min-h-[105px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block leading-none mb-2">
                      {kpi.label}
                    </span>
                    <span className="text-base font-black text-white font-mono leading-none truncate block">
                      {kpi.value}
                    </span>
                  </div>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} border flex items-center justify-center shadow-md shrink-0`}>
                    {kpi.icon}
                  </div>
                </div>
                
                <div className="flex flex-col mt-3">
                  <span className="text-[8px] text-slate-500 font-extrabold uppercase leading-none block">
                    {kpi.sub}
                  </span>
                  {kpi.progressCue}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN: Vehicle Volume Tracker Cards */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1.5 flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" />
            Product Volume Tracker
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/[0.01] border border-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aggregateMetrics.map(({ car, qty, incentive }, idx) => {
                const currentEffect = cardEffects[car.id] || { floaters: [], flash: false };
                
                // Fetch active tier details for this model's volume
                const modelSlabIdx = slabs.findIndex((s) => {
                  if (s.maxUnits === null) return qty >= s.minUnits;
                  return qty >= s.minUnits && qty <= s.maxUnits;
                });
                const slabBadge = modelSlabIdx !== -1 ? TIER_BADGES[Math.min(modelSlabIdx, TIER_BADGES.length - 1)] : null;

                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card
                      className={`bg-[#10101a] border shadow-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 relative group ${
                        currentEffect.flash ? "border-emerald-500/60 shadow-[0_0_15px_rgba(34,197,94,0.15)] scale-[1.01]" : "border-white/[0.04] hover:border-primary/20"
                      }`}
                    >
                      {/* Floaters Animate Container */}
                      <AnimatePresence>
                        {currentEffect.floaters.map((f) => (
                          <motion.span
                            key={f.id}
                            initial={{ opacity: 1, y: 0, scale: 0.9 }}
                            animate={{ opacity: 0, y: -45, scale: 1.25 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute right-4 top-4 text-[9px] font-black text-emerald-400 z-50 pointer-events-none select-none uppercase tracking-widest font-mono bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md"
                            onAnimationComplete={() => removeFloater(car.id, f.id)}
                          >
                            +1 Sold
                          </motion.span>
                        ))}
                      </AnimatePresence>

                      <CardContent className="p-0 flex h-36 relative">
                        {/* Left 35%: Image Showcase */}
                        <div className="relative w-[34%] bg-black/30 border-r border-white/[0.03] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#10101a] to-transparent opacity-85 z-10 pointer-events-none" />
                          <img
                            src={getCarImage(car.modelName)}
                            alt={car.modelName}
                            className="w-full h-full object-contain group-hover:scale-[1.08] transition-transform duration-500 z-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)] select-none pointer-events-none"
                          />
                        </div>

                        {/* Right 65%: Form Fields & Progress Meters */}
                        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-black text-xs text-white group-hover:text-primary transition-colors truncate leading-tight font-heading">
                                {car.modelName.replace("Toyota ", "")}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                <span className="text-[8px] font-extrabold uppercase text-slate-500 truncate block font-mono">
                                  {car.variant}
                                </span>
                                {slabBadge && (
                                  <span className={`text-[7px] font-extrabold uppercase px-1 py-0.2 rounded border shrink-0 ${slabBadge.bg} ${slabBadge.color}`}>
                                    {slabBadge.label}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Earnings Badge - non zero animate */}
                            <AnimatePresence>
                              {qty > 0 && (
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0 tabular-nums shadow-sm"
                                >
                                  ₹{incentive.toLocaleString("en-IN")}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Gamified volume sliders */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-extrabold uppercase text-slate-500">Sales volume:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={qty}
                                  disabled={submissionStatus === "APPROVED"}
                                  onChange={(e) => handleQtyChange(car.id, parseInt(e.target.value, 10) || 0)}
                                  className="w-9 h-5 text-center font-mono font-black text-[9px] text-white bg-slate-950 border border-white/[0.08] rounded focus:outline-none focus:border-primary disabled:opacity-50 tabular-nums"
                                />
                                <span className="text-[8px] font-bold text-slate-500 uppercase">u</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Decrement controls */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleDecrement(car.id)}
                                disabled={qty <= 0 || submissionStatus === "APPROVED"}
                                className="w-5 h-5 rounded bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/30 flex items-center justify-center text-slate-400 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <Minus className="h-2.5 w-2.5 shrink-0" />
                              </motion.button>
                              
                              <input
                                type="range"
                                min="0"
                                max={Math.max(100, qty)}
                                value={qty}
                                disabled={submissionStatus === "APPROVED"}
                                onChange={(e) => handleQtyChange(car.id, parseInt(e.target.value, 10))}
                                className="flex-1 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary border border-white/[0.04] disabled:opacity-50"
                              />

                              {/* Increment controls */}
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleIncrement(car.id)}
                                disabled={qty >= 1000 || submissionStatus === "APPROVED"}
                                className="w-5 h-5 rounded bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-emerald-500/30 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <Plus className="h-2.5 w-2.5 shrink-0" />
                              </motion.button>
                            </div>

                            {/* Mini Active Progress Meter */}
                            <SlabProgressMeter qty={qty} slabs={slabs} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar calculation panels */}
        <div className="space-y-6">
          {/* Target Milestone widget */}
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Milestone Target
          </h2>

          <Card className="bg-[#10101a] border border-white/[0.04] shadow-2xl relative">
            <CardContent className="p-5 flex items-center gap-5">
              {/* Target progress ring visually connected to KPI */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0 select-none">
                <svg width="80" height="80" className="transform -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="transparent"
                    stroke="url(#sidebarGoalGradient)"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 32}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 32) - (goalPercentage / 100) * (2 * Math.PI * 32) }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    strokeDashoffset={2 * Math.PI * 32}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="sidebarGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c8102e" />
                      <stop offset="100%" stopColor="#e8192c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-white font-mono leading-none tabular-nums">
                    {goalPercentage}%
                  </span>
                  <span className="text-[6px] text-slate-500 font-extrabold uppercase mt-0.5 tracking-widest">
                    REACHED
                  </span>
                </div>
              </div>

              {/* Goal Config */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Monthly Target</span>
                  {!isEditingGoal && submissionStatus !== "APPROVED" && (
                    <button
                      onClick={() => setIsEditingGoal(true)}
                      className="text-slate-500 hover:text-primary transition-colors p-0.5 rounded"
                      title="Edit Target"
                    >
                      <Edit2 className="h-2.5 w-2.5 shrink-0" />
                    </button>
                  )}
                </div>

                {isEditingGoal ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-20 h-7 text-[10px] px-2 bg-slate-950 border border-white/[0.08] text-white rounded font-mono font-black tabular-nums"
                    />
                    <Button size="icon" className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500 btn-press shrink-0" onClick={handleSaveGoal}>
                      <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    </Button>
                  </div>
                ) : (
                  <h4 className="text-sm font-black text-white font-mono leading-none tabular-nums">
                    ₹{targetGoal.toLocaleString("en-IN")}
                  </h4>
                )}

                <div className="text-[9px] font-bold mt-2">
                  {aggregatePayout >= targetGoal ? (
                    <span className="text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3 shrink-0" /> Target smashed!
                    </span>
                  ) : (
                    <span className="text-slate-500 font-semibold tracking-tight uppercase block truncate">
                      ₹{(targetGoal - aggregatePayout).toLocaleString("en-IN")} to goal
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive What-If Simulator widget */}
          <div className="space-y-2">
            <button
              onClick={() => setIsWhatIfExpanded(!isWhatIfExpanded)}
              className="w-full text-xs font-black uppercase tracking-widest text-slate-550 flex items-center justify-between px-1 hover:text-white transition-colors cursor-pointer select-none"
            >
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#cd7f32] shrink-0" />
                Projection & Simulator
              </span>
              <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                isWhatIfExpanded ? "rotate-90 text-white" : "text-slate-600"
              }`} />
            </button>

            <AnimatePresence>
              {isWhatIfExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-[#10101a] border border-white/[0.04] shadow-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] font-extrabold uppercase text-slate-500">
                        <span>Projected Sold Units:</span>
                        <span className="font-mono text-white tabular-nums">+{whatIfUnits} units</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={whatIfUnits}
                        onChange={(e) => setWhatIfUnits(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#cd7f32] border border-white/[0.04]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.04] leading-none">
                      <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl space-y-1">
                        <span className="text-[7px] font-extrabold text-slate-500 uppercase block">Projected Sold</span>
                        <span className="text-[10px] font-black text-white font-mono tabular-nums">
                          {aggregateCarsSold + whatIfUnits} units
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.01] border border-[#cd7f32]/20 rounded-xl space-y-1">
                        <span className="text-[7px] font-extrabold text-slate-500 uppercase block text-[#cd7f32]">Projected Payout</span>
                        <span className="text-[10px] font-black text-emerald-400 font-mono tabular-nums">
                          ₹{projectedPayout.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {projectedPayout > aggregatePayout && (
                      <p className="text-[9px] text-[#cd7f32] font-extrabold uppercase tracking-wide text-center">
                        🔥 Extra Yield: +₹{(projectedPayout - aggregatePayout).toLocaleString("en-IN")}!
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Earnings Breakdown line chart */}
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Earnings Breakdown
          </h2>

          <Card className="bg-[#10101a] border border-white/[0.04] shadow-2xl">
            <CardContent className="p-4">
              <IncentiveChart data={chartData} projectedUnits={whatIfUnits} />
            </CardContent>
          </Card>

          {/* Payout Split donut */}
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Payout Split
          </h2>

          <Card className="bg-[#10101a] border border-white/[0.04] shadow-2xl">
            <CardContent className="p-5">
              <PayoutDonutChart slices={donutSlices} />
            </CardContent>
          </Card>

          {/* Active Slab Matrix progression roadmap */}
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Active Slab Matrix
          </h2>

          <Card className="bg-[#10101a] border border-white/[0.04] shadow-2xl">
            <CardContent className="p-5">
              {slabs.length === 0 ? (
                <div className="py-4 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  No incentive slabs configured
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 py-1">
                  {/* Timeline visual line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-white/[0.04]" />

                  {slabs.map((slab, index) => {
                    const badge = TIER_BADGES[Math.min(index, TIER_BADGES.length - 1)];
                    const isUnlocked = aggregateCarsSold >= slab.minUnits;
                    const isCurrentActive = activeSlabIndex === index;

                    return (
                      <div key={slab.id} className="relative flex items-start gap-4 text-xs group">
                        {/* Slab segment timeline node */}
                        <div className={`absolute -left-[23px] w-2.5 h-2.5 rounded-full border flex items-center justify-center transition-all duration-300 z-10 ${
                          isCurrentActive ? "bg-primary border-primary scale-125 shadow-[0_0_8px_rgba(200,16,46,0.6)]" :
                          isUnlocked ? "bg-emerald-500 border-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" :
                          "bg-slate-950 border-white/[0.08]"
                        }`} />

                        <div className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${
                          isCurrentActive ? "bg-primary/5 border-primary/20 shadow-md" :
                          isUnlocked ? "bg-emerald-500/[0.02] border-emerald-500/10" :
                          "bg-white/[0.01] border-white/[0.02] opacity-55"
                        }`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-[9px] uppercase text-slate-400 flex items-center gap-1">
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                            </span>
                            <span className="font-mono font-black text-slate-200 text-[10px] tabular-nums">
                              ₹{slab.incentivePerCar.toLocaleString("en-IN")}/car
                            </span>
                          </div>
                          
                          <div className="text-[8px] text-slate-500 font-extrabold uppercase flex justify-between items-center leading-none">
                            <span>Slabs: {slab.maxUnits === null ? `${slab.minUnits}+ cars` : `${slab.minUnits} – ${slab.maxUnits} cars`}</span>
                            {isCurrentActive && slab.maxUnits && (
                              <span className="text-slate-400 font-black tracking-tight">{slab.maxUnits + 1 - aggregateCarsSold} to next tier</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Save Workflow submissions */}
              {submissionStatus !== "APPROVED" && (
                <div className="pt-5 border-t border-white/[0.04] mt-5 space-y-3">
                  {isDirty && (
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl animate-pulse">
                      <span>Unsaved modifications detected</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                  )}
                  <Button
                    onClick={handleSaveLogs}
                    disabled={isSaving || !isDirty}
                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/20 text-white font-black uppercase tracking-widest text-[9px] py-5 shadow-lg flex items-center justify-center gap-2 transition-colors duration-250 cursor-pointer h-10 border border-white/5 btn-press shimmer-sweep"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                        {submissionStatus === "PENDING" ? "Resubmit Statement" : "Submit Statement"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Period Transition Dialogue Warning */}
      <ConfirmDialog
        open={pendingPeriod !== null}
        onConfirm={() => {
          if (pendingPeriod) {
            setMonth(pendingPeriod.month);
            setYear(pendingPeriod.year);
            setPendingPeriod(null);
          }
        }}
        onCancel={() => setPendingPeriod(null)}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes in your sales log for this period. Changing the month or year now will discard these edits permanently."
        confirmLabel="Discard & Continue"
        variant="warning"
      />
    </motion.div>
  );
}
