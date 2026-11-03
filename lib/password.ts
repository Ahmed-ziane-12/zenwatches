export type PasswordCheckKey =
  | "auth.pwMin"
  | "auth.pwUpper"
  | "auth.pwLower"
  | "auth.pwNumber";

export interface PasswordCheck {
  key: PasswordCheckKey;
  test: (value: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

// Shared by the signup form and the signup API so the rules cannot drift apart.
export const PASSWORD_CHECKS: PasswordCheck[] = [
  { key: "auth.pwMin", test: (value) => value.length >= PASSWORD_MIN_LENGTH },
  { key: "auth.pwUpper", test: (value) => /[A-Z]/.test(value) },
  { key: "auth.pwLower", test: (value) => /[a-z]/.test(value) },
  { key: "auth.pwNumber", test: (value) => /\d/.test(value) },
];

export function isPasswordValid(value: string): boolean {
  return PASSWORD_CHECKS.every((check) => check.test(value));
}

export function passwordRequirementsError(): string {
  return `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include an uppercase letter, a lowercase letter, and a number.`;
}
