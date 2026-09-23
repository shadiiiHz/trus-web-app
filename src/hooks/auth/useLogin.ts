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
        // Header shows "first last"; the username is only a fallback for
        // when the backend sends neither name.
        displayName:
          [result.firstName, result.lastName].filter(Boolean).join(" ") || payload.username,
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
