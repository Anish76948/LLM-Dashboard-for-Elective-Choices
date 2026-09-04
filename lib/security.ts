/**
 * Security utilities: prompt injection mitigations and input sanitization
 */

export function sanitizeInput(input: string): string {
  if (!input) return "";
  // Strip control characters and dangerous prompt injection vectors
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // non-printable chars
    .replace(/(?:system\s+prompt|ignore\s+previous\s+instructions|disregard\s+rules|reveal\s+prompt)/gi, "[REDACTED]")
    .trim()
    .slice(0, 1000);
}

export function wrapUntrustedData(label: string, content: string): string {
  const sanitized = sanitizeInput(content);
  return `<UNTRUSTED_USER_DATA label="${label}">\n${sanitized}\n</UNTRUSTED_USER_DATA>`;
}

export function calculateSeatChance(enrolled: number, capacity: number): number {
  if (capacity <= 0) return 5;
  const ratio = enrolled / capacity;
  const rawChance = Math.round(100 * (1 - ratio));
  return Math.min(95, Math.max(5, rawChance));
}
