"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  type Priority,
  type TaskStatus,
} from "@/lib/types";

export interface TaskFilterState {
  search: string;
  priority: Priority | "all";
  status: TaskStatus | "all";
}

export interface TaskFiltersProps {
  value: TaskFilterState;
  onChange: (value: TaskFilterState) => void;
}

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search tasks…"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        aria-label="Filter by priority"
        value={value.priority}
        onChange={(e) =>
          onChange({ ...value, priority: e.target.value as Priority | "all" })
        }
        className="sm:w-40"
      >
        <option value="all">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by status"
        value={value.status}
        onChange={(e) =>
          onChange({ ...value, status: e.target.value as TaskStatus | "all" })
        }
        className="sm:w-40"
      >
        <option value="all">All statuses</option>
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
