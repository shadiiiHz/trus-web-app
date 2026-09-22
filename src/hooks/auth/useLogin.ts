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
        // The backend doesn't send a profile name yet — the username is all
        // login has to show in the header's account menu.
        displayName: payload.username,
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
