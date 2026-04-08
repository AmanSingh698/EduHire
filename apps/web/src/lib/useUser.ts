"use client";
import { useEffect, useState } from "react";

export type UserRole = "TEACHER" | "SCHOOL_ADMIN";

export interface CurrentUser {
  id: string;
  role: UserRole;
}

/**
 * Reads the non-httpOnly `user` cookie (set by the API on login/register).
 * Returns null if the user is not logged in or the cookie is missing.
 *
 * Shape of the cookie value: JSON string {"id":"...","role":"TEACHER|SCHOOL_ADMIN"}
 */
export function useUser(): { user: CurrentUser | null; isLoading: boolean } {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="))
        ?.split("=")
        .slice(1)  // handles values that may contain "="
        .join("=");

      if (raw) {
        const parsed = JSON.parse(decodeURIComponent(raw)) as CurrentUser;
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading };
}
