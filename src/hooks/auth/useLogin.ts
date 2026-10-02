import { useMutation } from "@tanstack/react-query";
import { loginUser, type AuthSessionResult, type LoginPayload } from "@/lib/api/authApi";
import { useAuth } from "@/hooks/useAuth";

interface UseLoginOptions {
  onSuccess?: (result: AuthSessionResult) => void;
}

/** `mutate` resolves with the result (or rejects with the API error); `isLoading` mirrors the pending state. */
export function useLogin(options?: UseLoginOptions) {
  const { authenticate } = useAuth();
  const mutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (result, payload) => {
      authenticate({
        token: result.sessionToken,
        expiresAt: result.expiresAt,
        ready: result.ready,
        // Header shows the login response's first + last name, then its
        // `customer` full name, falling back to the email when neither is sent.
        displayName:
          [result.firstName, result.lastName].filter(Boolean).join(" ") ||
          result.customer ||
          payload.email,
      });
      options?.onSuccess?.(result);
    },
  });

  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}

export default useLogin;
