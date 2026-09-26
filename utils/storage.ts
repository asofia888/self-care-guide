/**
 * Best-effort localStorage helpers. Storage can be unavailable (private mode,
 * blocked site data) or full, so every access is guarded and failures fall
 * back to defaults instead of breaking the app.
 */

export const readStorage = <T>(
  key: string,
  isValid: (value: unknown) => value is T
): T | undefined => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : undefined;
  } catch {
    return undefined;
  }
};

export const writeStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is optional; ignore quota and availability errors.
  }
};

export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Persistence is optional; ignore availability errors.
  }
};
