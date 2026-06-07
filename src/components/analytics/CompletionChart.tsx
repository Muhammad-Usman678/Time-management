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
          <defs>
            <linearGradient id="completionGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" />
              <stop
                offset="100%"
                stopColor="hsl(var(--success))"
                stopOpacity={0.75}
              />
            </linearGradient>
          </defs>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={total > 0 ? 3 : 0}
            cornerRadius={6}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  entry.name === "Completed"
                    ? "url(#completionGradient)"
                    : entry.color
                }
                fillOpacity={entry.name === "Pending" ? 0.35 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover, var(--card)))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              boxShadow:
                "0 1px 2px -1px rgb(0 0 0 / 0.08), 0 4px 16px -6px rgb(0 0 0 / 0.12)",
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
        <span className="text-gradient text-3xl font-semibold tracking-tight">
          {total}
        </span>
        <span className="text-xs font-medium text-muted-foreground">tasks</span>
      </div>
    </div>
  );
}
