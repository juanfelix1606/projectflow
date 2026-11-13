"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#635bff", "#0ea5e9", "#f59e0b", "#22c55e", "#a78bfa"];
type TrendPoint = { day: string; completed: number };
type DistributionPoint = { name: string; value: number };

export function DashboardCharts({ trend, distribution }: { trend: TrendPoint[]; distribution: DistributionPoint[] }) {
  const nonEmptyDistribution = distribution.filter((entry) => entry.value > 0);
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <section className="surface p-5">
        <div className="flex items-start justify-between"><div><h2 className="font-semibold tracking-tight">Weekly momentum</h2><p className="mt-1 text-xs text-slate-400">Tasks completed over the last 7 days</p></div><span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">This week</span></div>
        <div className="mt-5 h-[220px]" role="img" aria-label="Weekly task completion bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9298a8" }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#a3a8b5" }} />
              <Tooltip cursor={{ fill: "#f5f4ff" }} contentStyle={{ borderRadius: 10, border: "1px solid #e8eaf1", fontSize: 12 }} />
              <Bar dataKey="completed" name="Completed" fill="#635bff" radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="surface p-5">
        <div><h2 className="font-semibold tracking-tight">Project status</h2><p className="mt-1 text-xs text-slate-400">Current workspace portfolio</p></div>
        {nonEmptyDistribution.length ? (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-[190px] min-w-0 flex-1" role="img" aria-label="Projects by status chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={nonEmptyDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={3} stroke="none">{nonEmptyDistribution.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e8eaf1", fontSize: 12 }} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 pr-1">{nonEmptyDistribution.map((item, index) => <div key={item.name} className="flex items-center gap-2 text-[11px]"><span className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="capitalize text-slate-500">{item.name.replace("_", " ")}</span><span className="ml-auto font-semibold text-slate-800">{item.value}</span></div>)}</div>
          </div>
        ) : <div className="grid h-[200px] place-items-center text-center text-xs text-slate-400">Projects will appear here<br />when your team creates them.</div>}
      </section>
    </div>
  );
}
