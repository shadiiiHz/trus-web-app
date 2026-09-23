import { useState } from "react";
import { registerUser, type AuthSessionResult, type RegisterPayload } from "@/lib/api/authApi";
import { useAuth } from "@/hooks/useAuth";

interface UseRegisterOptions {
  onSuccess?: (result: AuthSessionResult) => void;
}

/**
 * Wraps `registerUser` with the same mutate/isLoading ergonomics as a
 * react-query mutation hook, minus the dependency this project doesn't have.
 * On success it hands the session token/ready flag to `AuthContext` so every
 * consumer of `useAuth()` sees the new state, not just this form.
 */
export function useRegister(options?: UseRegisterOptions) {
  const { authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (payload: RegisterPayload): Promise<AuthSessionResult> => {
    setIsLoading(true);
    try {
      const result = await registerUser(payload);
      authenticate({
        token: result.sessionToken,
        expiresAt: result.expiresAt,
        ready: result.ready,
        // The user just typed their names in, so show those as "first last".
        displayName: `${payload.firstName} ${payload.lastName}`.trim(),
      });
      options?.onSuccess?.(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}

export default useRegister;
