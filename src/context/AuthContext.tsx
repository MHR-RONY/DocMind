import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login,
  register,
  oauthLogin,
  logout,
  fetchCurrentUser,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

/** The value exposed by {@link AuthContext} to consumers via {@link useAuth}. */
export interface AuthContextValue {
  /** The authenticated user, or `null` when signed out. */
  user: AuthUser | null;
  /** True while the session is being hydrated on initial load. */
  isLoading: boolean;
  /** Authenticates with email + password and stores the session. */
  signIn: (email: string, password: string) => Promise<AuthUser>;
  /** Registers a new account and stores the session. */
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;
  /** Exchanges a provider ID token for a session and stores it. */
  signInWithOAuth: (
    provider: "google" | "apple",
    idToken: string,
  ) => Promise<AuthUser>;
  /** Ends the session locally and on the server. Navigation is the caller's job. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides authentication state and session helpers to the React tree.
 *
 * On mount it attempts to hydrate the session by calling `fetchCurrentUser()`,
 * which triggers the api layer's silent-refresh path (using the httpOnly
 * refresh cookie) to restore a session after a hard reload. A failed hydration
 * simply leaves the user signed out.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const current = await fetchCurrentUser();
        if (active) {
          setUser(current);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void hydrate();

    // The api layer dispatches `auth:logout` when a silent refresh fails
    // mid-session (the refresh cookie expired or was revoked). Clearing the
    // user here lets the route guards redirect protected pages to /login.
    const handleForcedLogout = () => {
      if (active) {
        setUser(null);
      }
    };
    window.addEventListener("auth:logout", handleForcedLogout);

    return () => {
      active = false;
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await login(email, password);
    setUser(result);
    return result;
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await register(name, email, password);
      setUser(result);
      return result;
    },
    [],
  );

  const signInWithOAuth = useCallback(
    async (provider: "google" | "apple", idToken: string) => {
      const result = await oauthLogin(provider, idToken);
      setUser(result);
      return result;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signInWithOAuth, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Accesses the authentication context.
 *
 * @throws Error if called outside of an {@link AuthProvider}.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
