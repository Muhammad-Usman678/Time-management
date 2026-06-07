"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { TagSelector } from "@/components/tasks/TagSelector";
import { toDate } from "@/lib/dates";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  type Task,
} from "@/lib/types";
import { taskCreateSchema, type TaskCreateInput } from "@/lib/validations";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";

// The deadline is captured as a datetime-local string (not the ISO format the
// zod schema expects), so it is held as a plain string here and normalized to
// ISO by hand on submit. Every other field keeps its schema-level validation.
const formSchema = taskCreateSchema
  .omit({ deadline: true })
  .extend({ deadline: z.string() });

type FormValues = z.infer<typeof formSchema>;

export interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

function toFormValues(task?: Task): FormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "todo",
    deadline: task?.deadline
      ? format(toDate(task.deadline), "yyyy-MM-dd'T'HH:mm")
      : "",
    isDaily: task?.isDaily ?? false,
    tagIds: task?.tags.map((t) => t.id) ?? [],
  };
}

export function TaskFormModal({ open, onClose, task }: TaskFormModalProps) {
  const isEdit = Boolean(task);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const pending = createTask.isPending || updateTask.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(task),
  });

  // Re-seed the form whenever the modal opens or the edited task changes.
  useEffect(() => {
    if (open) reset(toFormValues(task));
  }, [open, task, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload: TaskCreateInput = {
      title: values.title,
      description: values.description?.trim() ? values.description : null,
      priority: values.priority,
      status: values.status,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      isDaily: values.isDaily,
      tagIds: values.tagIds,
    };

    if (isEdit && task) {
      updateTask.mutate(
        { id: task.id, input: payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createTask.mutate(payload, { onSuccess: () => onClose() });
    }
  });

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={isEdit ? "Edit task" : "New task"}
      description={
        isEdit
          ? "Update the details of this task."
          : "Add a task to your list."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={pending}>
            {pending && <Spinner size={16} />}
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Write literature review"
            autoFocus
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional notes or context…"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" {...register("priority")}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="datetime-local" {...register("deadline")} />
        </div>

        <Controller
          control={control}
          name="isDaily"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 transition-colors hover:bg-secondary/70">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Daily recurring task
                </span>
                <span className="text-xs text-muted-foreground">
                  Resets every morning
                </span>
              </span>
            </label>
          )}
        />

        <div className="flex flex-col gap-1.5">
          <Label>Tags</Label>
          <Controller
            control={control}
            name="tagIds"
            render={({ field }) => (
              <TagSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
