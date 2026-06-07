"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { LoginInput, SignupInput } from "@/lib/validations";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

const ME_KEY = ["auth", "me"] as const;

/** Current logged-in user (null when unauthenticated). */
export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        return await api.get<AuthUser>("/api/auth/me");
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) =>
      api.post<AuthUser>("/api/auth/login", input),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) =>
      api.post<AuthUser>("/api/auth/signup", input),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/auth/logout"),
    onSuccess: () => {
      qc.clear();
      window.location.href = "/login";
    },
  });
}
