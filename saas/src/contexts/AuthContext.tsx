import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { authApi, type User, type LoginInput, type SignupInput } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/client";

export type { User, UserRole } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,   // start true — we check localStorage on mount
    error: null,
  });

  // ── On mount: restore session from localStorage token ──
  const loadUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setState({ user: null, isLoading: false, error: null });
      return;
    }
    try {
      const user = await authApi.me();
      setState({ user, isLoading: false, error: null });
    } catch {
      tokenStorage.clear();
      setState({ user: null, isLoading: false, error: null });
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Login ─────────────────────────────────────────────
  const login = useCallback(async (data: LoginInput) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { user, token } = await authApi.login(data);
      tokenStorage.set(token);
      setState({ user, isLoading: false, error: null });
    } catch (err: any) {
      const message = err?.message ?? "Login failed. Check your credentials.";
      setState((s) => ({ ...s, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  // ── Signup ────────────────────────────────────────────
  const signup = useCallback(async (data: SignupInput) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { user, token } = await authApi.signup(data);
      tokenStorage.set(token);
      setState({ user, isLoading: false, error: null });
    } catch (err: any) {
      const message = err?.message ?? "Registration failed.";
      setState((s) => ({ ...s, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
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
