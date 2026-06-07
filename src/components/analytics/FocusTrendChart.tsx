"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDayLabel } from "@/lib/dates";
import { formatDuration } from "@/lib/utils";

export interface FocusTrendChartProps {
  data: { date: string; seconds: number }[];
}

// Each datum carries raw seconds (for the tooltip) and hours (for the bar value).
function buildData(data: { date: string; seconds: number }[]) {
  return data.map((d) => ({
    date: d.date,
    seconds: d.seconds,
    hours: Number((d.seconds / 3600).toFixed(1)),
  }));
}

export function FocusTrendChart({ data }: FocusTrendChartProps) {
  const chartData = buildData(data);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="focusTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--brand-2))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDayLabel(value)}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={36}
            unit="h"
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            contentStyle={{
              background: "hsl(var(--popover, var(--card)))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              boxShadow:
                "0 1px 2px -1px rgb(0 0 0 / 0.08), 0 4px 16px -6px rgb(0 0 0 / 0.12)",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            labelFormatter={(value: string) => formatDayLabel(value)}
            formatter={(_value, _name, item) => [
              formatDuration((item?.payload?.seconds as number) ?? 0),
              "Focus",
            ]}
          />
          <Bar
            dataKey="hours"
            fill="url(#focusTrendGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
