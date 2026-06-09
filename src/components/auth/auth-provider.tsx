"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(data.user);
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        useAuthStore.setState({ loading: false });
      }
    }

    checkAuth();
  }, [setUser, setProfile]);

  return <>{children}</>;
}
