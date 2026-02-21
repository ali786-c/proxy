import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import api from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "client" | "admin";
  balance: number;
  referral_code: string;
}

export type UserRole = User["role"];

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (data: { email: string; password: string }) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setState({ user: null, isLoading: false, error: null });
      return;
    }

    try {
      const { data } = await api.get("/me");
      setState({ user: data, isLoading: false, error: null });
    } catch (err) {
      localStorage.removeItem("auth_token");
      setState({ user: null, isLoading: false, error: null });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: { email: string; password: string }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const response = await api.post("/login", data);
      localStorage.setItem("auth_token", response.data.access_token);
      setState({ user: response.data.user, isLoading: false, error: null });
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      setState((s) => ({ ...s, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (data: { name: string; email: string; password: string }) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const response = await api.post("/register", data);
      localStorage.setItem("auth_token", response.data.access_token);
      setState({ user: response.data.user, isLoading: false, error: null });
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      setState((s) => ({ ...s, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("auth_token");
      setState({ user: null, isLoading: false, error: null });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        clearError,
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
