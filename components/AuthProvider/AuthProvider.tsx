"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at?: string | null;
  customer_id?: string | number | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch (error) {
    console.error("Error loading user from localStorage:", error);
    return null;
  }
}

function persistUser(user: User | null) {
  try {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  } catch (error) {
    // Storage can be blocked (private mode); the in-memory session still works.
    console.error("Error saving user to localStorage:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  // Keep other tabs in sync when the visitor signs in or out elsewhere.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== "user") return;
      try {
        setUser(event.newValue ? (JSON.parse(event.newValue) as User) : null);
      } catch {
        setUser(null);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const signIn = (userData: User) => {
    setUser(userData);
    persistUser(userData);
  };

  const signOut = () => {
    setUser(null);
    persistUser(null);
    // Drop the HttpOnly admin cookie too, or dashboard APIs stay authorized until it expires.
    void fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
  };

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
