"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Car,
  IndianRupee,
  Users,
  Award,
  Loader2,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
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

const TIER_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
        <span className="text-xs text-slate-500 font-semibold">Gathering business intelligence...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-rose-500 dark:text-rose-400 text-xs font-semibold">
        {error || "An error occurred while fetching analytics."}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Gross Vehicles Sold",
            value: data.totalUnits.toLocaleString("en-IN"),
            sub: "Total volume logged",
            icon: <Car className="h-4 w-4" />,
            color: "from-indigo-500 to-blue-600",
          },
          {
            label: "Total Incentive Outlay",
            value: `₹${data.totalPayout.toLocaleString("en-IN")}`,
            sub: "Accrued commissions",
            icon: <IndianRupee className="h-4 w-4" />,
            color: "from-emerald-500 to-teal-600",
          },
          {
            label: "Sales Officers Active",
            value: data.leaderboard.length.toLocaleString("en-IN"),
            sub: "Reporting workforce",
            icon: <Users className="h-4 w-4" />,
            color: "from-amber-500 to-orange-600",
          },
          {
            label: "Top Sales Officer",
            value: topOfficer ? topOfficer.name : "N/A",
            sub: topOfficer ? `₹${topOfficer.payout.toLocaleString("en-IN")} earned` : "No sales logged",
            icon: <Award className="h-4 w-4" />,
            color: "from-primary to-primary",
          },
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                  {kpi.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">
                    {kpi.label}
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono truncate block leading-none mb-1">
                    {kpi.value}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                    {kpi.sub}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Chart / Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                  Sales Officer Leaderboard
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Performance rankings ranked by overall dynamic commission payout.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {data.leaderboard.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No active reporting officers.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 pl-2">Rank</th>
                        <th className="py-2.5">Sales Officer</th>
                        <th className="py-2.5 text-center">Cars Sold</th>
                        <th className="py-2.5 text-right pr-2">Payout Accrued</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {data.leaderboard.map((officer, index) => {
                        const rankEmblems = ["🥇", "🥈", "🥉"];
                        const emblem = rankEmblems[index] || `#${index + 1}`;

                        return (
                          <tr
                            key={officer.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="py-3 pl-2 font-bold font-mono text-slate-600 dark:text-slate-400">
                              {emblem}
                            </td>
                            <td className="py-3">
                              <div className="font-semibold text-slate-800 dark:text-white">
                                {officer.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {officer.email}
                              </div>
                            </td>
                            <td className="py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                              {officer.units}
                            </td>
                            <td className="py-3 text-right pr-2 font-mono font-black text-emerald-600 dark:text-emerald-400">
                              ₹{officer.payout.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Share */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                  Model Breakdown
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Performance volume contribution by vehicle models.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {data.modelStats.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No model sales data available.</div>
              ) : (
                <div className="space-y-3.5">
                  {data.modelStats.slice(0, 5).map((stat, index) => {
                    const pct = data.totalUnits > 0 ? (stat.units / data.totalUnits) * 100 : 0;
                    const color = TIER_COLORS[index % TIER_COLORS.length];

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold gap-2">
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            {stat.name} <span className="text-[10px] text-slate-400 uppercase">({stat.variant})</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                            {stat.units} units
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[10px] text-slate-400 w-8 text-right">
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

      {/* Month-over-Month Commission Outlay Trend */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
              <CardTitle className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                Payout Trends (MoM)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Month-over-month trajectory of aggregate commission payouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {data.trends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="text-xs font-medium">No MoM statistics to plot</span>
              </div>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                      axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as MonthlyTrend;
                        return (
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3.5 text-xs space-y-1 font-sans">
                            <p className="font-bold text-slate-800 dark:text-white mb-1.5 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                              {d.label} Performance
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              Volume: <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{d.units} units</span>
                            </p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              Payout: <span className="font-mono font-black">₹{d.payout.toLocaleString("en-IN")}</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
                    <Line
                      name="Payout (₹)"
                      type="monotone"
                      dataKey="payout"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      name="Units Sold"
                      type="monotone"
                      dataKey="units"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 1 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
