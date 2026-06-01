"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// Expensively curated luxury theme color spectrum
const CHART_COLORS = [
  "#c8102e", // Toyota Red
  "#3b82f6", // Sky Blue
  "#10b981", // Emerald
  "#a855f7", // Platinum Purple
  "#f59e0b", // Gold Amber
  "#ec4899", // Magenta
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#7dd8e6", // Light Blue
];

interface ChartData {
  name: string;
  incentive: number;
  units: number;
  projectedIncentive?: number; // Optional for what-if projections
}

interface IncentiveChartProps {
  data: ChartData[];
  projectedUnits?: number; // Optional projection count
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  
  return (
    <div className="bg-[#10101a] border border-white/[0.08] rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.6)] p-4 text-xs font-sans ring-1 ring-white/[0.04]">
      <p className="font-black text-white font-heading text-sm mb-2 uppercase tracking-wide border-b border-white/[0.04] pb-1">
        {d.name}
      </p>
      
      <div className="space-y-1.5 font-semibold text-[#85879b]">
        <p className="flex justify-between items-center gap-6">
          <span>Actual Units Sold:</span>
          <span className="font-mono font-black text-white tabular-nums">{d.units} units</span>
        </p>
        <p className="flex justify-between items-center gap-6">
          <span>Current Incentive:</span>
          <span className="font-mono font-black text-emerald-400 tabular-nums">
            ₹{d.incentive.toLocaleString("en-IN")}
          </span>
        </p>
        
        {d.projectedIncentive !== undefined && d.projectedIncentive > d.incentive && (
          <div className="pt-1.5 mt-1 border-t border-white/[0.04] text-[10px]">
            <p className="flex justify-between items-center gap-6 text-primary">
              <span>What-If Projection:</span>
              <span className="font-mono font-black tabular-nums">
                ₹{d.projectedIncentive.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IncentiveChart({ data, projectedUnits = 0 }: IncentiveChartProps) {
  const hasData = useMemo(() => data.some((d) => d.incentive > 0 || (d.projectedIncentive || 0) > 0), [data]);

  // Pre-process data to map projected projections
  const processedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      // For What-If: if projectedIncentive exists, represent it, else map incentive
      projectedIncentive: d.projectedIncentive || d.incentive,
    }));
  }, [data]);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500">
        <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] flex items-center justify-center mb-3">
          <span className="text-lg">📊</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enter sales data to unlock chart</span>
      </div>
    );
  }

  return (
    <div className="w-full h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData} margin={{ top: 8, right: 8, left: -14, bottom: 35 }}>
          {/* Extremely thin, minimal and elegant grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          
          <XAxis
            dataKey="name"
            tick={{ fontSize: 8, fill: "#85879b", fontWeight: 700 }}
            angle={-25}
            textAnchor="end"
            height={50}
            axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
            tickLine={false}
          />
          
          <YAxis
            tick={{ fontSize: 9, fill: "#85879b", fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
            className="tabular-nums"
          />
          
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.015)", radius: 8 }}
          />

          {/* Actual Incentive Bar */}
          <Bar
            dataKey="incentive"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {processedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.85}
              />
            ))}
          </Bar>

          {/* What-If Projection Bar (Dashed stack or overlay) */}
          {projectedUnits > 0 && (
            <Bar
              dataKey="projectedIncentive"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              fill="transparent"
              stroke="#c8102e"
              strokeWidth={1}
              strokeDasharray="3 3"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
