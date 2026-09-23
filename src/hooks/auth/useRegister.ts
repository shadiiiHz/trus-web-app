import { useState } from "react";
import { registerUser, type AuthSessionResult, type RegisterPayload } from "@/lib/api/authApi";

interface UseRegisterOptions {
  onSuccess?: (result: AuthSessionResult) => void;
}

/**
 * Wraps `registerUser` with the same mutate/isLoading ergonomics as a
 * react-query mutation hook, minus the dependency this project doesn't have.
 * Deliberately does NOT sign the user in: a new account has to verify its
 * email first, and only a later successful login creates a session.
 */
export function useRegister(options?: UseRegisterOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (payload: RegisterPayload): Promise<AuthSessionResult> => {
    setIsLoading(true);
    try {
      const result = await registerUser(payload);
      options?.onSuccess?.(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}

export default useRegister;
