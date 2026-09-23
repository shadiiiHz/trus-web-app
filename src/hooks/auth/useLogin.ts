import { useState } from "react";
import { loginUser, type AuthSessionResult, type LoginPayload } from "@/lib/api/authApi";
import { useAuth } from "@/hooks/useAuth";

interface UseLoginOptions {
  onSuccess?: (result: AuthSessionResult) => void;
}

/** Same shape as useRegister — see its comment for why this isn't a react-query hook. */
export function useLogin(options?: UseLoginOptions) {
  const { authenticate } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (payload: LoginPayload): Promise<AuthSessionResult> => {
    setIsLoading(true);
    try {
      const result = await loginUser(payload);
      authenticate({
        token: result.sessionToken,
        expiresAt: result.expiresAt,
        ready: result.ready,
        // Header shows the login response's first + last name, falling
        // back to the email when the backend sends neither.
        displayName:
          [result.firstName, result.lastName].filter(Boolean).join(" ") ||
          payload.email,
      });
      options?.onSuccess?.(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}

export default useLogin;
