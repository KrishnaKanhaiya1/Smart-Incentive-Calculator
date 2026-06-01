/**
 * Input validation and sanitization utilities
 * Ensures all user inputs are safe and properly formatted
 */

export function sanitizeString(input: unknown, maxLength = 500): string {
  const str = String(input || "").trim();
  if (str.length > maxLength) {
    return str.slice(0, maxLength);
  }
  return str;
}

export function sanitizeEmail(email: unknown): string {
  const sanitized = sanitizeString(email, 254).toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error("Invalid email address");
  }
  return sanitized;
}

export function sanitizeNumber(input: unknown, min = -Infinity, max = Infinity): number {
  const num = Number(input);
  if (isNaN(num)) {
    throw new Error("Invalid number");
  }
  if (num < min || num > max) {
    throw new Error(`Number must be between ${min} and ${max}`);
  }
  return Math.floor(num);
}

export function sanitizeAlphanumeric(input: unknown, maxLength = 100): string {
  const str = sanitizeString(input, maxLength);
  if (!/^[a-zA-Z0-9\s\-().,'&]+$/.test(str)) {
    throw new Error("String contains invalid characters");
  }
  return str;
}

export function preventXSS(input: string): string {
  const replacements: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return input.replace(/[&<>"']/g, (char) => replacements[char] || char);
}
