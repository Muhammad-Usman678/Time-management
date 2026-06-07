"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDuration } from "@/lib/utils";

export interface ProductiveHoursChartProps {
  data: { hour: number; seconds: number }[];
}

/** 0 -> "12a", 9 -> "9a", 13 -> "1p", 23 -> "11p". */
function hourLabel(hour: number): string {
  const suffix = hour < 12 ? "a" : "p";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

export function ProductiveHoursChart({ data }: ProductiveHoursChartProps) {
  const peakSeconds = Math.max(0, ...data.map((d) => d.seconds));
  const chartData = data.map((d) => ({
    hour: d.hour,
    label: hourLabel(d.hour),
    seconds: d.seconds,
    minutes: Number((d.seconds / 60).toFixed(0)),
    isPeak: d.seconds > 0 && d.seconds === peakSeconds,
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={36}
            unit="m"
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            contentStyle={{
              background: "hsl(var(--popover, var(--card)))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            labelFormatter={(label: string) => label}
            formatter={(_value, _name, item) => [
              formatDuration((item?.payload?.seconds as number) ?? 0),
              "Focus",
            ]}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {chartData.map((d) => (
              <Cell
                key={d.hour}
                fill={d.isPeak ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                fillOpacity={d.isPeak ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
