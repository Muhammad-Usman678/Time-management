"use client";

import { CheckCircle2, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskItem } from "@/components/tasks/TaskItem";
import type { Task } from "@/lib/types";

export interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  /** True when a filter/search is active, so the empty copy reflects that. */
  filtered?: boolean;
  onEdit: (task: Task) => void;
}

export function TaskList({ tasks, loading, filtered, onEdit }: TaskListProps) {
  if (loading) {
    return (
      <Card className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <Skeleton className="h-5 w-5 rounded-sm" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-2">
        <EmptyState
          icon={filtered ? ListTodo : CheckCircle2}
          title={filtered ? "No matching tasks" : "All clear"}
          description={
            filtered
              ? "Try adjusting your search or filters."
              : "Nothing on your list here. Create a task to get started."
          }
        />
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-border">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} />
      ))}
    </Card>
  );
}
