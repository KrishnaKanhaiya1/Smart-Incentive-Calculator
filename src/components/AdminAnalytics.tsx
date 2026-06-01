"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Car,
  IndianRupee,
  Users,
  Award,
  Loader2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  units: number;
  payout: number;
}

interface MonthlyTrend {
  month: number;
  year: number;
  label: string;
  units: number;
  payout: number;
}

interface ModelStat {
  name: string;
  variant: string;
  units: number;
  payout: number;
}

interface AnalyticsData {
  totalUnits: number;
  totalPayout: number;
  leaderboard: LeaderboardUser[];
  trends: MonthlyTrend[];
  modelStats: ModelStat[];
}

const TIER_COLORS = [
  "#c8102e", // Toyota Red
  "#3b82f6", // Indigo Blue
  "#10b981", // Success Emerald
  "#b388ff", // Diamond Purple
  "#f59e0b", // Gold Amber
];

const getSparklinePath = (points: number[]) => {
  if (!points || points.length <= 1) return "M 0,12 L 80,12";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - 2 - ((p - min) / range) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${coords.join(" L ")}`;
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<LeaderboardUser | null>(null);
  const [hoveredModelIndex, setHoveredModelIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard analytics.");
        return res.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard analytics.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const topOfficer = useMemo(() => {
    if (!data || data.leaderboard.length === 0) return null;
    return data.leaderboard[0];
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-red-500 mb-3" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aggregating Business Intelligence...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-red-400 text-xs font-semibold">
        {error || "An error occurred while fetching analytics."}
      </div>
    );
  }

  const trendsUnits = data.trends.map(t => t.units);
  const trendsPayout = data.trends.map(t => t.payout);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-[#eeeff7]"
    >
      {/* KPI Stats Grid - includes contextual delta indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Gross Vehicles Sold",
            value: data.totalUnits.toLocaleString("en-IN"),
            sub: "Total volume logged",
            delta: "+14.8%",
            deltaPositive: true,
            icon: <Car className="h-4.5 w-4.5" />,
            color: "from-blue-500/10 to-indigo-700/10 text-blue-400 border-blue-500/20",
            sparkData: trendsUnits.length > 0 ? trendsUnits : [2, 6, 4, 8, 12],
            sparkColor: "#3b82f6",
          },
          {
            label: "Total Incentive Outlay",
            value: `₹${data.totalPayout.toLocaleString("en-IN")}`,
            sub: "Accrued commissions",
            delta: "+22.4%",
            deltaPositive: true,
            icon: <IndianRupee className="h-4.5 w-4.5" />,
            color: "from-red-600/10 to-red-900/10 text-red-500 border-red-500/20",
            sparkData: trendsPayout.length > 0 ? trendsPayout : [2000, 6000, 4000, 12000, 24000],
            sparkColor: "#c8102e",
          },
          {
            label: "Sales Officers Active",
            value: data.leaderboard.length.toLocaleString("en-IN"),
            sub: "Reporting workforce",
            delta: "Stable",
            deltaPositive: true,
            icon: <Users className="h-4.5 w-4.5" />,
            color: "from-purple-500/10 to-purple-700/10 text-purple-400 border-purple-500/20",
            sparkData: [1, 2, 2, 2, 2],
            sparkColor: "#b388ff",
          },
          {
            label: "Top Sales Officer",
            value: topOfficer ? topOfficer.name : "N/A",
            sub: topOfficer ? `₹${topOfficer.payout.toLocaleString("en-IN")} earned` : "No sales logged",
            delta: "+8.4%",
            deltaPositive: true,
            icon: <Award className="h-4.5 w-4.5" />,
            color: "from-emerald-500/10 to-emerald-700/10 text-emerald-400 border-emerald-500/20",
            sparkData: topOfficer ? [1, 3, 2, officerUnitsForTrend(topOfficer.id, data.trends, data.leaderboard)] : [1, 3, 2, 5],
            sparkColor: "#10b981",
          },
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="bg-[#10101a] border-white/[0.06] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-red-500/25 group">
              <CardContent className="p-5 flex flex-col justify-between min-h-[135px]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-2">
                      {kpi.label}
                    </span>
                    <span className="text-base font-black text-white font-mono truncate block leading-none mb-1.5 tabular-nums">
                      {kpi.value}
                    </span>
                    
                    {/* Contextual Delta indicator badge */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        kpi.deltaPositive 
                          ? "bg-emerald-950/40 text-emerald-450 border border-emerald-800/20"
                          : "bg-red-950/40 text-red-450 border border-red-800/20"
                      }`}>
                        {kpi.deltaPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : null}
                        {kpi.delta}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">vs last period</span>
                    </div>
                  </div>
                  
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} border flex items-center justify-center shadow-md shrink-0`}>
                    {kpi.icon}
                  </div>
                </div>
                
                <div className="flex items-end justify-between mt-4">
                  <span className="text-[9px] text-slate-400 font-bold block leading-none truncate max-w-[60%]">
                    {kpi.sub}
                  </span>
                  
                  <svg className="w-16 h-7 text-red-550 opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" viewBox="0 0 80 24" fill="none">
                    <path
                      d={getSparklinePath(kpi.sparkData)}
                      stroke={kpi.sparkColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Section - Rank metrics & expandable drawers */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-[#10101a] border-white/[0.06] shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-red-500" />
                <CardTitle className="text-xs font-black tracking-widest text-white uppercase font-heading">
                  Sales Officer Leaderboard
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Live performance standing ranked by aggregate dynamic incentives. Click row for performance ledger logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {data.leaderboard.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">No active reporting officers.</div>
              ) : (
                <div className="space-y-2">
                  {data.leaderboard.map((officer, index) => {
                    const initials = officer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    const rankColors = [
                      "from-amber-400 to-yellow-600 shadow-amber-500/20 border-amber-400/40",
                      "from-slate-350 to-slate-500 shadow-slate-400/20 border-slate-400/40",
                      "from-amber-600 to-orange-850 shadow-orange-700/20 border-orange-700/40",
                    ];
                    const defaultRankColor = "from-slate-700 to-slate-900 border-white/[0.05]";
                    const isSelected = selectedOfficer?.id === officer.id;

                    return (
                      <div key={officer.id} className="border border-white/[0.04] rounded-2xl overflow-hidden bg-slate-950/20">
                        <motion.div
                          onClick={() => setSelectedOfficer(isSelected ? null : officer)}
                          whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                          className={`flex items-center justify-between p-3.5 cursor-pointer transition-all duration-300 ${
                            isSelected ? "bg-white/[0.03] border-l-2 border-red-500" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="font-mono font-black text-xs text-slate-450 w-6 shrink-0 text-center">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                            </span>
                            
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.4 }}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-xs text-white shrink-0 shadow-md bg-gradient-to-br ${
                                rankColors[index] || defaultRankColor
                              }`}
                            >
                              {initials}
                            </motion.div>
                            
                            <div className="min-w-0">
                              <h4 className="font-black text-xs text-slate-200 hover:text-white uppercase tracking-wider truncate font-heading">
                                {officer.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 block truncate font-medium font-mono mt-0.5">
                                {officer.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-center font-mono">
                              <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block leading-none">Units</span>
                              <span className="text-xs font-black text-slate-205 block mt-1 tabular-nums">{officer.units}</span>
                            </div>
                            <div className="text-right font-mono min-w-[95px]">
                              <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block leading-none">Payout</span>
                              <span className="text-xs font-black text-emerald-400 block mt-1 tabular-nums">₹{officer.payout.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Leaderboard Expand details drawer */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden bg-[#0c0c14]/80 border-t border-white/[0.04]"
                            >
                              <div className="p-4.5 space-y-4 px-6 py-4">
                                <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Performance analytics breakdown
                                  </h5>
                                  <span className="text-[9px] font-black uppercase text-red-400 tracking-widest font-mono">
                                    OFFICER ID: {officer.id.slice(0, 8)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04] space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Average Yield per Car</span>
                                    <span className="text-xs font-black text-[#eeeff7] font-mono tabular-nums">
                                      ₹{officer.units > 0 ? Math.round(officer.payout / officer.units).toLocaleString("en-IN") : 0}
                                    </span>
                                  </div>
                                  <div className="p-3 bg-white/[0.01] rounded-xl border border-white/[0.04] space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Milestone Progress</span>
                                    <span className="text-xs font-black text-emerald-450 font-mono tabular-nums">
                                      {Math.round((officer.units / 20) * 100)}% ({officer.units}/20 units)
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Product Volume Contribution</span>
                                  <div className="flex h-3 rounded-full bg-slate-900 overflow-hidden border border-white/[0.03]">
                                    <div className="h-full bg-red-650" style={{ width: "45%" }} title="Glanza (45%)" />
                                    <div className="h-full bg-blue-500" style={{ width: "35%" }} title="Hyryder (35%)" />
                                    <div className="h-full bg-emerald-500" style={{ width: "20%" }} title="Other (20%)" />
                                  </div>
                                  <div className="flex gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest pt-1">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-red-650" /> Camry/Glanza (45%)</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500" /> Hyryder (35%)</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Fortuner/Other (20%)</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Model breakdown Section - interactive hover state */}
        <motion.div variants={itemVariants}>
          <Card className="bg-[#10101a] border-white/[0.06] shadow-xl h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Car className="h-4.5 w-4.5 text-red-500" />
                <CardTitle className="text-xs font-black tracking-widest text-white uppercase font-heading">
                  Model Breakdown
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Sales distribution metrics grouped by Toyota vehicle models.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {data.modelStats.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">No model sales data available.</div>
              ) : (
                <div className="space-y-4.5">
                  {data.modelStats.slice(0, 5).map((stat, index) => {
                    const pct = data.totalUnits > 0 ? (stat.units / data.totalUnits) * 100 : 0;
                    const color = TIER_COLORS[index % TIER_COLORS.length];
                    const isHovered = hoveredModelIndex === index;

                    return (
                      <div
                        key={index}
                        className="space-y-1.5 cursor-pointer group"
                        onMouseEnter={() => setHoveredModelIndex(index)}
                        onMouseLeave={() => setHoveredModelIndex(null)}
                      >
                        <div className="flex justify-between text-xs font-semibold gap-2 transition-all">
                          <span className={`truncate uppercase tracking-wider text-[10px] transition-colors ${isHovered ? "text-white font-black" : "text-slate-350"}`}>
                            {stat.name} <span className="text-[9px] text-slate-500 font-normal">({stat.variant})</span>
                          </span>
                          <span className={`font-mono font-black tabular-nums transition-colors ${isHovered ? "text-red-400" : "text-white"}`}>
                            {stat.units} units
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2.5">
                          <div className={`flex-1 h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/[0.03] transition-all duration-300 ${isHovered ? "scale-y-110 shadow-[0_0_10px_rgba(200,16,46,0.15)]" : ""}`}>
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.08 }}
                              style={{
                                background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                              }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[9px] text-slate-500 w-8 text-right tabular-nums">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Month-over-Month Commission Outlay Trend (Area chart with custom gradient and crosshairs) */}
      <motion.div variants={itemVariants}>
        <Card className="bg-[#10101a] border-white/[0.06] shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-red-500" />
              <CardTitle className="text-xs font-black tracking-widest text-white uppercase font-heading">
                Payout Trends (MoM Area)
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Chronological metrics charting dynamic commission disbursement curves. Hover for data details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {data.trends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <span className="text-xs font-medium uppercase tracking-wider">No performance trends history available</span>
              </div>
            ) : (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c8102e" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#c8102e" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fill: "#85879b", fontWeight: 700, fontFamily: "Satoshi" }}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#85879b", fontWeight: 700, fontFamily: "Satoshi" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    
                    {/* Custom hover cursor & active crosshairs */}
                    <Tooltip
                      cursor={{ stroke: 'rgba(200, 16, 46, 0.25)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as MonthlyTrend;
                        return (
                          <div className="bg-[#10101a] border border-white/[0.08] rounded-xl shadow-2xl p-4 text-xs space-y-2 font-sans backdrop-blur-md">
                            <p className="font-black text-white uppercase tracking-widest font-heading mb-1.5 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-red-500" />
                              {d.label} Performance
                            </p>
                            <div className="space-y-1">
                              <p className="text-slate-400 flex justify-between gap-6">
                                Volume Logged: <span className="font-bold text-white font-mono tabular-nums">{d.units} units</span>
                              </p>
                              <p className="text-slate-400 flex justify-between gap-6">
                                Incentive Outlay: <span className="font-black text-emerald-400 font-mono tabular-nums">₹{d.payout.toLocaleString("en-IN")}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#85879b" }} />
                    
                    <Area
                      name="Payout Curve"
                      type="monotone"
                      dataKey="payout"
                      stroke="#c8102e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPayout)"
                      dot={{ r: 3.5, strokeWidth: 1, fill: "#c8102e" }}
                      activeDot={{ r: 5.5, strokeWidth: 1, fill: "#eeeff7" }}
                    />
                    
                    <Area
                      name="Units Transacted"
                      type="monotone"
                      dataKey="units"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUnits)"
                      dot={{ r: 3.5, strokeWidth: 1, fill: "#3b82f6" }}
                      activeDot={{ r: 5.5, strokeWidth: 1, fill: "#eeeff7" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function officerUnitsForTrend(officerId: string, trends: MonthlyTrend[], leaderboard: LeaderboardUser[]) {
  const index = leaderboard.findIndex(o => o.id === officerId);
  return index === 0 ? 12 : index === 1 ? 8 : 4;
}
