import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api/client";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  handle?: string;
  bio?: string | null;
  location?: string | null;
  roles: string[];
  approval: "unverified" | "pending" | "approved" | "rejected";
};

type Credentials = { email: string; password: string };
type Registration = Credentials & { name: string; password_confirmation: string };
type AuthResponse = { token: string; user: AuthUser };

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: Credentials) => Promise<void>;
  register: (data: Registration) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "xtouch:auth-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      setUser(await apiFetch<AuthUser>("/user"));
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function authenticate(path: string, data: Credentials | Registration) {
    const result = await apiFetch<AuthResponse>(path, {
      method: "POST",
      body: JSON.stringify(data),
    });
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      /* Clear locally either way. */
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: (data) => authenticate("/auth/login", data),
      register: (data) => authenticate("/auth/register", data),
      logout,
      refresh,
    }),
    [user, isLoading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
