import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshStarted = useRef(false);

  const setSession = useCallback((session) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
  }, []);

  // Update the authenticated user's information globally.
  const updateUser = useCallback((updates) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      return {
        ...currentUser,
        ...updates,
      };
    });
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Session refresh failed.");
    }

    setSession(data);
    return data;
  }, [setSession]);

  useEffect(() => {
    // Prevent duplicate refresh requests during React StrictMode development checks.
    if (refreshStarted.current) return;

    refreshStarted.current = true;

    async function restoreSession() {
      try {
        await refreshSession();
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [refreshSession, clearSession]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: Boolean(user && accessToken),
    setSession,
    updateUser,
    clearSession,
    refreshSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}

export { API_URL };
