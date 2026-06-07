"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Tag } from "@/lib/types";
import type { TagCreateInput } from "@/lib/validations";

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags(),
    queryFn: () => api.get<Tag[]>("/api/tags"),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TagCreateInput) => api.post<Tag>("/api/tags", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create tag");
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/tags/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags() });
      // A deleted tag may have been attached to tasks — refresh those too.
      qc.invalidateQueries({ queryKey: queryKeys.allTasks() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
      toast.success("Tag deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tag");
    },
  });
}
