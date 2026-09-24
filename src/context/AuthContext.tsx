import { useEffect, useRef, useReducer, type ReactNode } from "react";
import { fetchProfile } from "@/lib/api/authApi";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/lib/api/session";
import { AuthActionType, AuthContext, type AuthAction, type AuthenticateParams, type AuthState } from "./auth-context";

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  isReady: false,
  displayName: null,
  logoUrl: null,
};

// setTimeout's delay is a 32-bit signed int internally — anything longer than
// this fires immediately in some engines. Session tokens are short-lived, so
// clamping just means the lazy expiry check in getAuthSession() (run on the
// next read) is the backstop for a token whose expiry is implausibly far out.
const MAX_TIMEOUT_MS = 2_147_483_647;

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionType.Initialize:
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        isReady: action.payload.isReady,
        displayName: action.payload.displayName,
      };
    case AuthActionType.Authenticate:
      return {
        ...state,
        isAuthenticated: true,
        isReady: action.payload.isReady,
        displayName: action.payload.displayName,
      };
    case AuthActionType.Logout:
      return { ...state, isAuthenticated: false, isReady: false, displayName: null, logoUrl: null };
    case AuthActionType.SetLogo:
      return { ...state, logoUrl: action.payload.logoUrl };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current !== null) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const logout = () => {
    clearLogoutTimer();
    clearAuthSession();
    dispatch({ type: AuthActionType.Logout });
  };

  // Actively logs the session out the moment it expires, rather than only
  // catching it the next time something happens to read sessionStorage.
  const scheduleAutoLogout = (expiresAt: string | undefined) => {
    clearLogoutTimer();
    if (!expiresAt) return;

    const delay = new Date(expiresAt).getTime() - Date.now();
    if (delay <= 0) {
      logout();
      return;
    }
    logoutTimerRef.current = setTimeout(logout, Math.min(delay, MAX_TIMEOUT_MS));
  };

  useEffect(() => {
    const session = getAuthSession();
    dispatch({
      type: AuthActionType.Initialize,
      payload: {
        isAuthenticated: Boolean(session),
        isReady: session?.ready ?? false,
        displayName: session?.displayName ?? null,
      },
    });
    if (session) {
      scheduleAutoLogout(session.expiresAt);
    }
    return clearLogoutTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLogoUrl = (logoUrl: string | null) => {
    dispatch({ type: AuthActionType.SetLogo, payload: { logoUrl: logoUrl || null } });
  };

  const logoRequestRef = useRef<AbortController | null>(null);

  const refreshLogo = () => {
    logoRequestRef.current?.abort();
    const controller = new AbortController();
    logoRequestRef.current = controller;
    fetchProfile(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) setLogoUrl(profile.logoUrl);
      })
      // The logo is cosmetic — a failed read just leaves the placeholder.
      .catch(() => {});
  };

  // Loads the account's logo for the header once a session exists (on
  // reload, login or register), and drops any in-flight read on sign-out.
  useEffect(() => {
    if (!state.isAuthenticated) {
      logoRequestRef.current?.abort();
      return;
    }
    refreshLogo();
    return () => logoRequestRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated]);

  const authenticate = ({ token, expiresAt, ready, displayName }: AuthenticateParams) => {
    // No token means there's no session to keep — don't mark the user
    // signed in on in-memory state alone (it would show in the navbar
    // while sessionStorage is empty and vanish on reload).
    if (!token) return;
    setAuthSession(token, ready, expiresAt, displayName);
    scheduleAutoLogout(expiresAt);
    dispatch({
      type: AuthActionType.Authenticate,
      payload: { isReady: ready, displayName: displayName ?? null },
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, authenticate, logout, setLogoUrl, refreshLogo }}>
      {children}
    </AuthContext.Provider>
  );
}
