import { createContext } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  /** The backend's `ready` flag: false while the complete-profile step is still owed. */
  isReady: boolean;
  /** Name/email entered at register or login — shown in the header's account menu. Null when signed out. */
  displayName: string | null;
  /** Logo uploaded on the Edit Account page — shown before the name in the account menu. Null until loaded or when none is set. */
  logoUrl: string | null;
}

export const AuthActionType = {
  Initialize: "INITIALIZE",
  Authenticate: "AUTHENTICATE",
  Logout: "LOGOUT",
  SetLogo: "SET_LOGO",
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
  | { type: typeof AuthActionType.Logout }
  | { type: typeof AuthActionType.SetLogo; payload: { logoUrl: string | null } };

export interface AuthenticateParams {
  /** Omitted when the backend didn't send a session token (nothing to persist). */
  token?: string;
  expiresAt?: string;
  ready: boolean;
  displayName?: string;
}

export interface AuthContextValue extends AuthState {
  /** Persists the session token and marks the user authenticated; a no-op when no token was sent. Called by useLogin on success. */
  authenticate: (params: AuthenticateParams) => void;
  logout: () => void;
  /** Updates the account-menu logo, e.g. with the URL the Edit Account page just loaded. */
  setLogoUrl: (logoUrl: string | null) => void;
  /** Re-reads the logo from the profile endpoint. */
  refreshLogo: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
