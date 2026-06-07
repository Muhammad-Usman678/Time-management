"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, qs } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AnalyticsRange, FocusSession } from "@/lib/types";

/** Focus sessions within a range (default: today). */
export function useFocusSessions(range: AnalyticsRange = "day") {
  return useQuery({
    queryKey: queryKeys.focusSessions(range),
    queryFn: () =>
      api.get<FocusSession[]>("/api/focus-sessions" + qs({ range })),
  });
}

/** Delete a focus session, then refresh dependent caches. */
export function useDeleteFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/focus-sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allFocusSessions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Session deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete session");
    },
  });
}
