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
  { label: "Bronze", icon: "🥉", color: "text-amber-700 dark:text-amber-300" },
  { label: "Silver", icon: "🥈", color: "text-slate-600 dark:text-slate-300" },
  { label: "Gold", icon: "🥇", color: "text-yellow-600 dark:text-yellow-300" },
  { label: "Platinum", icon: "💎", color: "text-indigo-700 dark:text-indigo-300" },
  { label: "Diamond", icon: "👑", color: "text-primary dark:text-primary" },
];

const DONUT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ec4899",
  "#06b6d4", "#EB0A1E", "#f97316", "#14b8a6",
  "#e11d48", "#3b82f6", "#84cc16", "#a855f7",
];

/* ──── Helper: Animated Number ──── */
const AnimatedNumber = React.memo(function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;
    if (from === to) return;

    const duration = 400;
    const steps = 20;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(to);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
    </span>
  );
});

/* ──── Helper: SVG Donut Chart ──── */
const PayoutDonutChart = React.memo(function PayoutDonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = useMemo(() => slices.reduce((s, sl) => s + sl.value, 0), [slices]);
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
      <div className="flex flex-col items-center justify-center py-4 text-slate-400 dark:text-slate-500">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-1.5">
          <IndianRupee className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold">No earnings to display</span>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 42;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-28 h-28 shrink-0">
        <svg width="112" height="112" viewBox="0 0 112 112" className="transform -rotate-90">
          {segments.map((seg, i) => (
            <motion.circle
              key={i}
              cx="56" cy="56" r="42"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: circumference - (seg.pct / 100) * circumference,
              }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              strokeDashoffset={circumference}
              style={{
                transformOrigin: "center",
                transform: `rotate(${(seg.start / 100) * 360}deg)`,
              }}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-bold">Total</span>
          <span className="text-sm font-black text-slate-800 dark:text-white font-mono leading-none">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 w-full">
        {segments.filter((s) => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{seg.label}</span>
            </div>
            <span className="font-mono font-bold text-slate-800 dark:text-white shrink-0">₹{seg.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ──── Helper: Slab Progress Meter ──── */
function SlabProgressMeter({ qty, slabs }: { qty: number; slabs: IncentiveSlab[] }) {
  if (qty === 0 || slabs.length === 0) return null;

  const maxSlab = slabs[slabs.length - 1];
  const effectiveMax = maxSlab.maxUnits || maxSlab.minUnits + 5;
  const barMax = Math.max(effectiveMax, qty);

  return (
    <div className="mt-3 space-y-1">
      <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        {slabs.map((slab, idx) => {
          const tierMax = slab.maxUnits ?? barMax;
          const width = ((tierMax - slab.minUnits + 1) / barMax) * 100;
          const fillPct = Math.min(1, Math.max(0, (qty - slab.minUnits + 1) / (tierMax - slab.minUnits + 1)));
          const badge = TIER_BADGES[Math.min(idx, TIER_BADGES.length - 1)];
          return (
            <div key={slab.id || idx} className="relative" style={{ width: `${width}%` }} title={`${badge.label}: ${slab.minUnits}–${slab.maxUnits ?? "∞"} units → ₹${slab.incentivePerCar}/car`}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: fillPct }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 origin-left rounded-full"
                style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length], opacity: fillPct > 0 ? 1 : 0.15 }}
              />
            </div>
          );
        })}
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

  // Goal Tracker
  const [targetGoal, setTargetGoal] = useState(50000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("50000");

  const isDirty = useMemo(() => {
    const allKeys = new Set([...Object.keys(salesMap), ...Object.keys(savedSalesMap)]);
    for (const key of allKeys) {
      const q1 = salesMap[key] || 0;
      const q2 = savedSalesMap[key] || 0;
      if (q1 !== q2) return true;
    }
    return false;
  }, [salesMap, savedSalesMap]);

  // Dynamic year range
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  // Fetch dashboard data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sales?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to load dashboard data.");
      const data = await res.json();
      setCars(data.cars || []);
      setSlabs(data.slabs || []);

      const map: Record<string, number> = {};
      if (data.savedRecords) {
        for (const rec of data.savedRecords as { carModelId: string; quantity: number }[]) {
          map[rec.carModelId] = rec.quantity;
        }
      }
      setSalesMap(map);
      setSavedSalesMap(map);
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

  // Handlers
  const handleQtyChange = (carId: string, qty: number) => {
    if (qty > 1000) {
      toast.warning("Sales volume per model is capped at 1,000 units per month for calculation safety.");
      setSalesMap((prev) => ({ ...prev, [carId]: 1000 }));
      return;
    }
    setSalesMap((prev) => ({ ...prev, [carId]: Math.max(0, Math.floor(qty)) }));
  };

  const handleIncrement = (carId: string) => {
    const currentQty = salesMap[carId] || 0;
    if (currentQty >= 1000) {
      toast.warning("Sales volume per model is capped at 1,000 units.");
      return;
    }
    setSalesMap((prev) => ({ ...prev, [carId]: currentQty + 1 }));
  };

  const handleDecrement = (carId: string) => {
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
      toast.success(`Sales records for ${MONTH_NAMES[month - 1]} ${year} saved successfully.`);
      setSavedSalesMap(salesMap);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save records.");
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Export
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Nippon Toyota", 14, 17);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Smart Incentive Calculator — Sales Performance Report", 14, 25);
      doc.text(`${MONTH_NAMES[month - 1]} ${year}`, 196, 17, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 196, 25, { align: "right" });

      // Table
      const tableData = cars
        .filter((car) => (salesMap[car.id] || 0) > 0)
        .map((car) => {
          const qty = salesMap[car.id] || 0;
          const incentive = calculatePayout(qty, slabs).totalIncentive;
          return [
            car.modelName,
            car.variant,
            qty.toString(),
            `₹${incentive.toLocaleString("en-IN")}`,
          ];
        });

      autoTable(doc, {
        startY: 42,
        head: [["Model Name", "Variant", "Units Sold", "Incentive"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          2: { halign: "center", fontStyle: "bold" },
          3: { halign: "right", fontStyle: "bold" },
        },
      });

      // Summary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, finalY + 5, 182, 18, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Total Incentive Payout:", 20, finalY + 16);
      doc.setFontSize(12);
      doc.text(`₹${aggregatePayout.toLocaleString("en-IN")}`, 190, finalY + 16, { align: "right" });

      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("This report is auto-generated by Nippon Toyota SIC. Figures are based on the current slab configuration.", 14, 285);

      doc.save(`NipponToyota_Incentive_${MONTH_NAMES[month - 1]}_${year}.pdf`);
      toast.success("PDF report downloaded successfully.");
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

  const goalPercentage = useMemo(
    () => Math.min(100, Math.round((aggregatePayout / targetGoal) * 100)),
    [aggregatePayout, targetGoal]
  );

  // Fixed: use r=40 to match SVG circle r="40"
  const goalCircleCircumference = 2 * Math.PI * 40;
  const goalCircleOffset = goalCircleCircumference - (goalPercentage / 100) * goalCircleCircumference;

  const donutSlices = useMemo(
    () =>
      aggregateMetrics
        .filter((m) => m.incentive > 0)
        .map((m, i) => ({
          label: `${m.car.modelName} — ${m.car.variant}`,
          value: m.incentive,
          color: DONUT_COLORS[i % DONUT_COLORS.length],
        })),
    [aggregateMetrics]
  );

  const chartData = useMemo(
    () =>
      aggregateMetrics
        .filter((m) => m.qty > 0)
        .map((m) => ({
          name: `${m.car.modelName.replace("Toyota ", "")} ${m.car.variant}`,
          incentive: m.incentive,
          units: m.qty,
        })),
    [aggregateMetrics]
  );

  /* ──── Render ──── */
  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Cars Sold",
            value: <AnimatedNumber value={aggregateCarsSold} />,
            icon: <Car className="h-4 w-4" />,
            color: "from-indigo-500 to-violet-600",
          },
          {
            label: "Estimated Incentive",
            value: <AnimatedNumber value={aggregatePayout} prefix="₹" />,
            icon: <IndianRupee className="h-4 w-4" />,
            color: "from-emerald-500 to-teal-600",
          },
          {
            label: "Active Models",
            value: cars.length,
            icon: <Layers className="h-4 w-4" />,
            color: "from-amber-500 to-orange-600",
          },
          {
            label: "Active Slabs",
            value: slabs.length,
            icon: <TrendingUp className="h-4 w-4" />,
            color: "from-rose-500 to-pink-600",
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                    {kpi.label}
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono leading-none">
                    {kpi.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Period Selector & Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <select
            value={month}
            onChange={(e) => handlePeriodChange(Number(e.target.value), year)}
            className="bg-transparent text-sm font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => handlePeriodChange(month, Number(e.target.value))}
            className="bg-transparent text-sm font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
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
          className="flex items-center gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
        >
          <FileDown className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Car Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-2">
            <Car className="h-4 w-4 text-indigo-500" />
            Volume Tracker
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aggregateMetrics.map(({ car, qty, incentive }, index) => {
                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate leading-snug">
                              {car.modelName}
                            </h4>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              {car.variant}
                            </span>
                          </div>
                          {qty > 0 && (
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                              ₹{incentive.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl px-1 py-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDecrement(car.id)}
                              disabled={qty <= 0}
                              className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-rose-500 active:scale-95 shrink-0 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-600"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={qty === 0 ? "" : qty}
                              placeholder="0"
                              onChange={(e) => {
                                const text = e.target.value.replace(/[^0-9]/g, "");
                                const val = text === "" ? 0 : parseInt(text, 10);
                                handleQtyChange(car.id, val);
                              }}
                              className="w-12 h-8 p-0 text-center font-mono font-black text-slate-800 dark:text-white text-sm bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 select-all"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleIncrement(car.id)}
                              className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 active:scale-95 shrink-0 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-600"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Slab Progress */}
                        {slabs.length > 0 && (
                          <SlabProgressMeter qty={qty} slabs={slabs} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Goal Tracker */}
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" />
            Milestone Target
          </h2>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <CardContent className="p-5 flex items-center gap-5">
              {/* Circular Progress */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg width="96" height="96" className="transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                  <motion.circle
                    cx="48" cy="48" r="40"
                    fill="transparent"
                    stroke="url(#goalGradient)"
                    strokeWidth="8"
                    strokeDasharray={goalCircleCircumference}
                    animate={{ strokeDashoffset: goalCircleOffset }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-800 dark:text-white font-mono leading-none">
                    {goalPercentage}%
                  </span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">
                    Reached
                  </span>
                </div>
              </div>

              {/* Goal Config */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Goal</span>
                  {!isEditingGoal && (
                    <button
                      onClick={() => setIsEditingGoal(true)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded"
                      title="Edit Goal"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {isEditingGoal ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      type="number"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-20 h-7 text-xs px-2 py-0 font-mono font-bold"
                    />
                    <Button size="icon" className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500" onClick={handleSaveGoal}>
                      <Check className="h-3.5 w-3.5 text-white" />
                    </Button>
                  </div>
                ) : (
                  <h4 className="text-base font-black text-slate-800 dark:text-white font-mono leading-none">
                    ₹{targetGoal.toLocaleString("en-IN")}
                  </h4>
                )}

                <div className="text-[10px] font-bold mt-2">
                  {aggregatePayout >= targetGoal ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Target goal smashed!
                    </span>
                  ) : (
                    <span className="text-slate-500 font-semibold">
                      ₹{(targetGoal - aggregatePayout).toLocaleString("en-IN")} to milestone
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incentive Chart */}
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            Earnings Breakdown
          </h2>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <IncentiveChart data={chartData} />
            </CardContent>
          </Card>

          {/* Donut */}
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Payout Split
          </h2>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5">
              <PayoutDonutChart slices={donutSlices} />
            </CardContent>
          </Card>

          {/* Slab Matrix + Save */}
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            Active Slab Matrix
          </h2>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
              {slabs.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  No incentive slabs configured.
                </div>
              ) : (
                slabs.map((slab, index) => {
                  const badge = TIER_BADGES[Math.min(index, TIER_BADGES.length - 1)];
                  return (
                    <div key={slab.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{badge.icon}</span>
                        <span className="font-extrabold text-slate-600 dark:text-slate-300">
                          {slab.maxUnits === null
                            ? `${slab.minUnits}+ Units`
                            : `${slab.minUnits} – ${slab.maxUnits} Units`}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                        ₹{slab.incentivePerCar.toLocaleString("en-IN")}/car
                      </span>
                    </div>
                  );
                })
              )}

              {/* Save Button */}
              <div className="pt-4 space-y-2.5">
                {isDirty && (
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 px-3 py-1.5 rounded-xl animate-pulse">
                    <span>You have unsaved changes</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                )}
                <Button
                  onClick={handleSaveLogs}
                  disabled={isSaving || !isDirty}
                  className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs py-5 shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      Saving log files...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Save Period Records
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Period Transition Unsaved Changes Warning Dialog */}
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
    </div>
  );
}
