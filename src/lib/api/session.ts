/**
 * Persisted half of the auth session: the short-lived token `registerUser`/
 * `loginUser` hand back, plus the `ready` flag (profile-completion status)
 * that came with it. `AuthContext` is the only consumer that should read or
 * write this directly — everything else goes through `useAuth()`.
 *
 * Kept in sessionStorage rather than localStorage: it's cleared when the tab
 * closes instead of lingering indefinitely, which is the safer default for a
 * token an XSS bug could otherwise read back at any later time.
 */
const TOKEN_KEY = "trus_session_token";
const EXPIRES_AT_KEY = "trus_session_expires_at";
const READY_KEY = "trus_session_ready";
const DISPLAY_NAME_KEY = "trus_session_display_name";

export interface StoredAuthSession {
  token: string;
  ready: boolean;
  /** ISO timestamp, when the backend sent one — lets AuthContext schedule an active logout timer, not just a lazy check on next read. */
  expiresAt?: string;
  /** Name/username entered at register or login, shown in the header's account menu — the backend doesn't send a profile name yet. */
  displayName?: string;
}

export function setAuthSession(
  token: string,
  ready: boolean,
  expiresAt?: string,
  displayName?: string,
): void {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.setItem(READY_KEY, String(ready));
    if (expiresAt) {
      window.sessionStorage.setItem(EXPIRES_AT_KEY, expiresAt);
    } else {
      window.sessionStorage.removeItem(EXPIRES_AT_KEY);
    }
    if (displayName) {
      window.sessionStorage.setItem(DISPLAY_NAME_KEY, displayName);
    } else {
      window.sessionStorage.removeItem(DISPLAY_NAME_KEY);
    }
  } catch {
    // sessionStorage can be unavailable (private browsing, disabled storage);
    // the session simply won't survive a reload in that case.
  }
}

export function getAuthSession(): StoredAuthSession | null {
  try {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const expiresAt = window.sessionStorage.getItem(EXPIRES_AT_KEY);
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      clearAuthSession();
      return null;
    }

    return {
      token,
      ready: window.sessionStorage.getItem(READY_KEY) === "true",
      expiresAt: expiresAt ?? undefined,
      displayName: window.sessionStorage.getItem(DISPLAY_NAME_KEY) ?? undefined,
    };
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(EXPIRES_AT_KEY);
    window.sessionStorage.removeItem(READY_KEY);
    window.sessionStorage.removeItem(DISPLAY_NAME_KEY);
  } catch {
    // ignore
  }
}
