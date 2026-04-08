"use client";
import { useCallback } from "react";

export function useLogout() {
  const logout = useCallback(async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors — still clear cookies client-side
    }
    // Clear the user cookie client-side (httpOnly ones are cleared by the API)
    document.cookie = "user=; Max-Age=0; path=/";
    document.cookie = "accessToken=; Max-Age=0; path=/";
    document.cookie = "refreshToken=; Max-Age=0; path=/";

    // Full page navigation — ensures the middleware reads fresh (empty) cookies
    window.location.href = "/";
  }, []);

  return logout;
}
