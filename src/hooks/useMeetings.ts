"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Meeting } from "@/lib/types";
import type {
  MeetingCreateInput,
  MeetingUpdateInput,
} from "@/lib/validations";

/** Fetch all of the user's meetings (no range filter), ordered by dateTime asc. */
export function useMeetings() {
  return useQuery({
    queryKey: queryKeys.meetings(),
    queryFn: () => api.get<Meeting[]>("/api/meetings"),
  });
}

/** Invalidate the meetings list + the dashboard after any meeting mutation. */
function invalidateMeetings(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.meetings() });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MeetingCreateInput) =>
      api.post<Meeting>("/api/meetings", input),
    onSuccess: () => {
      invalidateMeetings(qc);
      toast.success("Meeting created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create meeting");
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: MeetingUpdateInput & { id: string }) =>
      api.patch<Meeting>(`/api/meetings/${id}`, input),
    onSuccess: () => {
      invalidateMeetings(qc);
      toast.success("Meeting updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update meeting");
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/meetings/${id}`),
    onSuccess: () => {
      invalidateMeetings(qc);
      toast.success("Meeting deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete meeting");
    },
  });
}
