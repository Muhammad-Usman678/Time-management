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
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="flex items-start gap-3 px-4 py-3.5 pl-5"
          >
            <Skeleton className="h-5 w-5 rounded-sm" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="animate-fade-in p-2">
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
    <div className="flex flex-col gap-2.5">
      {tasks.map((task) => (
        <div key={task.id} className="animate-fade-in">
          <TaskItem task={task} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
}
