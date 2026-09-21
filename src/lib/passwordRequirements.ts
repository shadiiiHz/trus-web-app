export const passwordRequirements = [
  { key: "minLength", test: (value: string) => value.length >= 8 },
  { key: "hasUppercase", test: (value: string) => /[A-Z]/.test(value) },
  { key: "hasLowercase", test: (value: string) => /[a-z]/.test(value) },
  { key: "hasNumber", test: (value: string) => /\d/.test(value) },
  {
    key: "hasSpecialChar",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export function meetsPasswordRequirements(value: string): boolean {
  return passwordRequirements.every(({ test }) => test(value));
}
