"use client";

import { Tabs } from "@/components/ui/tabs";
import type { AnalyticsRange } from "@/lib/types";

const RANGE_TABS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export interface RangeSwitcherProps {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}

export function RangeSwitcher({ range, onRangeChange }: RangeSwitcherProps) {
  return (
    <Tabs
      tabs={RANGE_TABS}
      value={range}
      onValueChange={(v) => onRangeChange(v as AnalyticsRange)}
    />
  );
}
