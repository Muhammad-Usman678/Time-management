"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface CompletionChartProps {
  completedTasks: number;
  pendingTasks: number;
}

export function CompletionChart({
  completedTasks,
  pendingTasks,
}: CompletionChartProps) {
  const chartData = [
    { name: "Completed", value: completedTasks, color: "hsl(var(--success))" },
    { name: "Pending", value: pendingTasks, color: "hsl(var(--muted-foreground))" },
  ];
  const total = completedTasks + pendingTasks;

  return (
    <div className="relative h-[260px] w-full">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={total > 0 ? 2 : 0}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                fillOpacity={entry.name === "Pending" ? 0.4 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover, var(--card)))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label: total task count for the range snapshot. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
        <span className="text-2xl font-semibold tracking-tight">{total}</span>
        <span className="text-xs text-muted-foreground">tasks</span>
      </div>
    </div>
  );
}
