"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListTodo } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { cn, PRIORITY_DOT } from "@/lib/utils";
import { deadlineInfo } from "@/lib/dates";
import type { Task, TaskStatus } from "@/lib/types";

export interface TodayTasksCardProps {
  tasks?: Task[];
  loading?: boolean;
}

/** Today's tasks with inline done-toggling. Fed by the dashboard payload. */
export function TodayTasksCard({ tasks, loading }: TodayTasksCardProps) {
  const queryClient = useQueryClient();

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.patch<Task>(`/api/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allTasks() });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    },
  });

  const done = tasks?.filter((t) => t.status === "done").length ?? 0;
  const total = tasks?.length ?? 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">Today&apos;s tasks</CardTitle>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              {done} of {total} done
            </p>
          )}
        </div>
        <Link
          href="/tasks"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks for today"
            description="Daily tasks and anything due today will appear here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => {
              const isDone = task.status === "done";
              const dl = deadlineInfo(task.deadline, task.status);
              return (
                <li key={task.id} className="flex items-center gap-3 py-2.5">
                  <Checkbox
                    checked={isDone}
                    disabled={toggle.isPending}
                    onCheckedChange={(checked) =>
                      toggle.mutate({
                        id: task.id,
                        status: checked ? "done" : "todo",
                      })
                    }
                  />
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      PRIORITY_DOT[task.priority]
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate text-sm",
                      isDone && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </span>
                  {dl && (
                    <span
                      className={cn(
                        "shrink-0 text-xs",
                        dl.isOverdue
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {dl.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
