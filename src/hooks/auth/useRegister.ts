import { useMutation } from "@tanstack/react-query";
import { registerUser, type AuthSessionResult, type RegisterPayload } from "@/lib/api/authApi";

interface UseRegisterOptions {
  onSuccess?: (result: AuthSessionResult) => void;
}

/**
 * Deliberately does NOT sign the user in: a new account has to verify its
 * email first, and only a later successful login creates a session.
 */
export function useRegister(options?: UseRegisterOptions) {
  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (result) => options?.onSuccess?.(result),
  });

  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}

export default useRegister;
