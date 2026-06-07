"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDuration } from "@/lib/utils";

export interface TagBreakdownChartProps {
  data: { tag: string; color: string; seconds: number }[];
}

export function TagBreakdownChart({ data }: TagBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <EmptyState
          icon={Tags}
          title="No tagged focus yet"
          description="Tag your tasks and focus on them to see where your time goes."
        />
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="tag"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={96}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            contentStyle={{
              background: "hsl(var(--popover, var(--card)))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
            }}
            formatter={(_value, _name, item) => [
              formatDuration((item?.payload?.seconds as number) ?? 0),
              item?.payload?.tag as string,
            ]}
          />
          <Bar dataKey="seconds" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell key={entry.tag} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
