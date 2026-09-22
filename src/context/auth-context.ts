import { createContext } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  /** The backend's `ready` flag: false while the complete-profile step is still owed. */
  isReady: boolean;
  /** Name/username entered at register or login — shown in the header's account menu. Null when signed out. */
  displayName: string | null;
}

export const AuthActionType = {
  Initialize: "INITIALIZE",
  Authenticate: "AUTHENTICATE",
  Logout: "LOGOUT",
} as const;

export type AuthAction =
  | {
      type: typeof AuthActionType.Initialize;
      payload: { isAuthenticated: boolean; isReady: boolean; displayName: string | null };
    }
  | {
      type: typeof AuthActionType.Authenticate;
      payload: { isReady: boolean; displayName: string | null };
    }
  | { type: typeof AuthActionType.Logout };

export interface AuthenticateParams {
  /** Omitted when the backend didn't send a session token (nothing to persist). */
  token?: string;
  expiresAt?: string;
  ready: boolean;
  displayName?: string;
}

export interface AuthContextValue extends AuthState {
  /** Persists the session token (if any) and marks the user authenticated. Called by useLogin/useRegister on success. */
  authenticate: (params: AuthenticateParams) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
