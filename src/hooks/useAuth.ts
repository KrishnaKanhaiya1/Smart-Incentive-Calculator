"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SALES";
}

/**
 * Custom hook for authentication. Replaces localStorage-based session pattern.
 * Calls /api/auth/me on mount to verify the JWT cookie.
 * Redirects to login if not authenticated or wrong role.
 */
export function useAuth(requiredRole?: "ADMIN" | "SALES") {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (requiredRole && data.user.role !== requiredRole) {
          router.replace("/");
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [requiredRole, router]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }, [router]);

  return { user, loading, logout };
}
