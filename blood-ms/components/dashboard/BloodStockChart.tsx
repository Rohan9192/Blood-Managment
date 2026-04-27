"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList
} from "recharts";

type BloodStockData = { bloodGroup: string; unitsAvailable: number };

const getBarConfig = (units: number) => {
  if (units < 10) return { fill: "#ef4444", shadow: "#ef444440", label: "Critical", glow: "#ef4444" };
  if (units < 25) return { fill: "#f59e0b", shadow: "#f59e0b40", label: "Low",      glow: "#f59e0b" };
  return            { fill: "#3b82f6",   shadow: "#3b82f640",   label: "Healthy",  glow: "#3b82f6" };
};

const CustomBar = (props: any) => {
  const { x, y, width, height, value } = props;
  const config = getBarConfig(value);
  const id = `grad-${value}-${x}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={config.fill}   stopOpacity={0.95} />
          <stop offset="100%" stopColor={config.fill}   stopOpacity={0.45} />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glow shadow bar */}
      <rect
        x={x + width * 0.1}
        y={y + 4}
        width={width * 0.8}
        height={height}
        rx={8}
        fill={config.shadow}
        filter={`url(#glow-${id})`}
      />
      {/* Main bar */}
      <rect
        x={x + 2}
        y={y}
        width={width - 4}
        height={height}
        rx={8}
        fill={`url(#${id})`}
      />
      {/* Shine stripe */}
      <rect
        x={x + 6}
        y={y + 3}
        width={6}
        height={height * 0.5}
        rx={3}
        fill="rgba(255,255,255,0.18)"
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const config = getBarConfig(val);
  return (
    <div className="px-4 py-3 rounded-2xl border border-slate-700/60 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
      <p className="text-slate-400 text-xs font-medium mb-1">{label?.replace("_", " ")}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.fill }} />
        <span className="text-white font-bold text-lg">{val}</span>
        <span className="text-slate-500 text-xs">units</span>
      </div>
      <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full font-medium"
        style={{ color: config.fill, backgroundColor: config.fill + "20" }}>
        {config.label}
      </span>
    </div>
  );
};

export default function BloodStockChart({ data }: { data: BloodStockData[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[320px] flex items-center justify-center text-slate-500 text-sm">No stock data available</div>;
  }

  const criticalCount = data.filter(d => d.unitsAvailable < 10).length;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-5 text-xs">
        {[
          { color: "#3b82f6", label: "Healthy (≥25)" },
          { color: "#f59e0b", label: "Low (10–24)" },
          { color: "#ef4444", label: "Critical (<10)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
        {criticalCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-400 font-medium">{criticalCount} critical</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 5 }} barCategoryGap="25%">
            <defs>
              <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#334155" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
              strokeOpacity={0.7}
            />
            <ReferenceLine y={10} stroke="#ef444450" strokeDasharray="4 4" strokeWidth={1.5} />
            <ReferenceLine y={25} stroke="#f59e0b40" strokeDasharray="4 4" strokeWidth={1.5} />
            <XAxis
              dataKey="bloodGroup"
              stroke="transparent"
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              tickFormatter={(v) => v.replace("_", " ").replace("POS","+").replace("NEG","−")}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: "#475569", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(51,65,85,0.2)", rx: 8 }} />
            <Bar dataKey="unitsAvailable" shape={<CustomBar />} radius={[8, 8, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={getBarConfig(entry.unitsAvailable).fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
