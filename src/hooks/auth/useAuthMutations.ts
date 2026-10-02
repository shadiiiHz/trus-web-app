/**
 * react-query mutation wrappers for the remaining auth/profile writes. Each
 * exposes `mutate` (a promise-returning `mutateAsync`, so forms keep their
 * try/catch + `reportApiError` flow) and `isLoading`.
 */
import { useMutation } from "@tanstack/react-query";
import {
  changePassword,
  generateLogo,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  updateProfile,
  verifyCaptcha,
  type ChangePasswordPayload,
  type GenerateLogoPayload,
  type ProfileUpdatePayload,
  type ResetPasswordPayload,
} from "@/lib/api/authApi";

function wrap<T>(mutation: { mutateAsync: T; isPending: boolean }) {
  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useVerifyCaptcha() {
  return wrap(
    useMutation({
      mutationFn: ({ challengeId, answer }: { challengeId: string; answer: string }) =>
        verifyCaptcha(challengeId, answer),
    }),
  );
}

export function useRequestPasswordReset() {
  return wrap(useMutation({ mutationFn: (email: string) => requestPasswordReset(email) }));
}

export function useResetPassword() {
  return wrap(useMutation({ mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload) }));
}

export function useChangePassword() {
  return wrap(useMutation({ mutationFn: (payload: ChangePasswordPayload) => changePassword(payload) }));
}

export function useResendVerification() {
  return wrap(useMutation({ mutationFn: (email: string) => resendVerificationEmail(email) }));
}

export function useUpdateProfile() {
  return wrap(useMutation({ mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload) }));
}

export function useGenerateLogo() {
  return wrap(useMutation({ mutationFn: (payload: GenerateLogoPayload) => generateLogo(payload) }));
}
