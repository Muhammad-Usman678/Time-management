"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Task, TaskStatus, TaskView } from "@/lib/types";
import type { TaskCreateInput, TaskUpdateInput } from "@/lib/validations";

export function useTasks(view: TaskView) {
  return useQuery({
    queryKey: queryKeys.tasks(view),
    queryFn: () => api.get<Task[]>(`/api/tasks?view=${view}`),
  });
}

/** Invalidate every task view + the dashboard after any task mutation. */
function invalidateTasks(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.allTasks() });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskCreateInput) => api.post<Task>("/api/tasks", input),
    onSuccess: () => {
      invalidateTasks(qc);
      toast.success("Task created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskUpdateInput }) =>
      api.patch<Task>(`/api/tasks/${id}`, input),
    onSuccess: () => {
      invalidateTasks(qc);
      toast.success("Task updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/tasks/${id}`),
    onSuccess: () => {
      invalidateTasks(qc);
      toast.success("Task deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
}

/** Convenience mutation for the checkbox / status toggle — silent on success. */
export function useToggleTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.patch<Task>(`/api/tasks/${id}`, { status }),
    onSuccess: () => {
      invalidateTasks(qc);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
}
