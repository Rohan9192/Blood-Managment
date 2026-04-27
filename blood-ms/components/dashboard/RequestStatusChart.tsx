"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RequestStatusData {
  status: string;
  _count: { _all: number };
}

const STATUS_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  PENDING:   { color: "#f59e0b", glow: "#f59e0b30", label: "Pending"   },
  APPROVED:  { color: "#3b82f6", glow: "#3b82f630", label: "Approved"  },
  FULFILLED: { color: "#10b981", glow: "#10b98130", label: "Fulfilled" },
  REJECTED:  { color: "#ef4444", glow: "#ef444430", label: "Rejected"  },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const cfg = STATUS_CONFIG[name] ?? { color: "#64748b", label: name };
  return (
    <div className="px-4 py-3 rounded-2xl border border-slate-700/60 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
        <span className="text-slate-300 text-xs font-semibold">{cfg.label}</span>
      </div>
      <span className="text-white font-black text-2xl">{value}</span>
      <span className="text-slate-500 text-xs ml-1">requests</span>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function RequestStatusChart({ data }: { data: RequestStatusData[] }) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item._count._all,
    ...STATUS_CONFIG[item.status],
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length) {
    return <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>;
  }

  return (
    <div className="w-full">
      <div className="relative">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color}60)` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-white text-2xl font-black">{total}</p>
          <p className="text-slate-500 text-xs">Total</p>
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-800/40">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-400 text-xs truncate">{d.label}</span>
            <span className="ml-auto text-white text-xs font-bold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
