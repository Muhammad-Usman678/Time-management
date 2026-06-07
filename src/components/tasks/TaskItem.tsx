"use client";

import { useState } from "react";
import { CalendarClock, Pencil, Repeat, Timer, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { TagChip } from "@/components/tasks/TagChip";
import { cn, formatDuration, PRIORITY_DOT } from "@/lib/utils";
import { deadlineInfo } from "@/lib/dates";
import { STATUS_LABELS, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";
import { useDeleteTask, useToggleTaskStatus } from "@/hooks/useTasks";

export interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const toggle = useToggleTaskStatus();
  const deleteTask = useDeleteTask();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const done = task.status === "done";
  const deadline = deadlineInfo(task.deadline, task.status);

  function handleToggle(checked: boolean) {
    toggle.mutate({ id: task.id, status: checked ? "done" : "todo" });
  }

  function handleStatusChange(status: TaskStatus) {
    toggle.mutate({ id: task.id, status });
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 py-3.5 pl-5 shadow-soft card-hover",
        done && "opacity-75"
      )}
    >
      {/* Left priority accent bar. */}
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-r-full transition-opacity",
          PRIORITY_DOT[task.priority],
          done && "opacity-40"
        )}
        aria-hidden
      />

      <div className="pt-0.5">
        <Checkbox
          checked={done}
          onCheckedChange={handleToggle}
          disabled={toggle.isPending}
          id={`task-${task.id}`}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "cursor-pointer text-sm font-medium leading-snug text-foreground",
              done && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </label>

          {/* Edit + delete, kept compact on the right; fade in on hover/focus. */}
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete task"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {task.description && (
          <p
            className={cn(
              "line-clamp-2 text-sm text-muted-foreground",
              done && "line-through"
            )}
          >
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />

          {task.isDaily && (
            <Badge variant="secondary">
              <Repeat size={12} />
              Daily
            </Badge>
          )}

          {deadline && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                deadline.isOverdue
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground"
              )}
            >
              <CalendarClock size={13} />
              {deadline.label}
            </span>
          )}

          {task.focusSeconds ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Timer size={13} />
              {formatDuration(task.focusSeconds)}
            </span>
          ) : null}

          {task.tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </div>
      </div>

      <div className="shrink-0 self-center">
        <Select
          aria-label="Task status"
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          disabled={toggle.isPending}
          className="h-8 w-32 rounded-lg text-xs"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteTask.mutate(task.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
        title="Delete task"
        description={`"${task.title}" will be permanently removed.`}
        confirmText="Delete"
        destructive
        loading={deleteTask.isPending}
      />
    </div>
  );
}
