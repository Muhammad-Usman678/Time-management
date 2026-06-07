"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DashboardData } from "@/lib/types";

/** Fetches the aggregated dashboard payload (today tasks, meetings, stats). */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => api.get<DashboardData>("/api/dashboard"),
  });
}
