"use client";

import { useQuery } from "@tanstack/react-query";
import { api, qs } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AnalyticsData, AnalyticsRange } from "@/lib/types";

/** Fetches aggregated analytics for the given range. */
export function useAnalytics(range: AnalyticsRange) {
  return useQuery({
    queryKey: queryKeys.analytics(range),
    queryFn: () => api.get<AnalyticsData>(`/api/analytics${qs({ range })}`),
  });
}
