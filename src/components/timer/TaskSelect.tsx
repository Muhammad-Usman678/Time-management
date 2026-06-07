"use client";

import { useQuery } from "@tanstack/react-query";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api, qs } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useTimerStore } from "@/store/timerStore";
import type { Task } from "@/lib/types";

export function TaskSelect() {
  const taskId = useTimerStore((s) => s.taskId);
  const taskTitle = useTimerStore((s) => s.taskTitle);
  const selectTask = useTimerStore((s) => s.selectTask);

  const { data: tasks, isLoading } = useQuery({
    queryKey: queryKeys.tasks("all"),
    queryFn: () => api.get<Task[]>("/api/tasks" + qs({ view: "all" })),
  });

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (!id) {
      selectTask(null, null);
      return;
    }
    const task = tasks?.find((t) => t.id === id);
    selectTask(id, task?.title ?? null);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-1.5">
      <Label htmlFor="focus-task">Focusing on</Label>
      <Select
        id="focus-task"
        value={taskId ?? ""}
        onChange={onChange}
        disabled={isLoading}
      >
        <option value="">No task</option>
        {tasks?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </Select>
      {taskTitle && (
        <p className="truncate text-xs text-muted-foreground">
          Attributing focus to: {taskTitle}
        </p>
      )}
    </div>
  );
}
