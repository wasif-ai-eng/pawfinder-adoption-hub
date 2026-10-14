"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/database";

const STORAGE_KEY = "pf-current-user-id";

type AuthContextValue = {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  switchUser: (userId: number) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .order("full_name", { ascending: true });

      if (!isMounted) return;

      if (fetchError) {
        setError(`Failed to load users: ${fetchError.message}`);
        setLoading(false);
        return;
      }

      const loadedUsers = data ?? [];
      setUsers(loadedUsers);

      const storedId =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      const storedUserId = storedId ? Number(storedId) : null;
      const matchedUser = loadedUsers.find(
        (user) => user.user_id === storedUserId
      );

      setCurrentUserId((matchedUser ?? loadedUsers[0])?.user_id ?? null);
      setLoading(false);
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const switchUser = useCallback((userId: number) => {
    setCurrentUserId(userId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(userId));
    }
  }, []);

  const currentUser = useMemo(
    () => users.find((user) => user.user_id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ users, currentUser, loading, error, switchUser }),
    [users, currentUser, loading, error, switchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
