/**
 * US phone formatting for the restaurant survey.
 *
 * Restaurants type a number however they keep it — 919.555.0100, +1 919 555
 * 0100, 9195550100 — and those all end up on a public listing and in a `tel:`
 * link. Normalising as they type means every listing reads the same way, and
 * the admin never has to tidy one by hand.
 */

/** Digits only, with a leading US country code dropped. */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  // "+1 919 555 0100" and "1-919-555-0100" are the same number as the 10-digit
  // form; keeping the 1 would push the last digit out of the mask.
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.slice(0, 10);
}

/**
 * Format for display as the field is typed: `(919)555-0100`.
 *
 * Partial input formats progressively rather than waiting for ten digits, so
 * the shape is visible from the third character on. Anything that isn't a
 * plausible US number is returned as typed — an international number should
 * not be silently mangled into a US mask.
 */
export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === 0) return "";

  // More than ten digits, or a leading + that survived, means this isn't a
  // 10-digit US number. Leave it alone rather than truncate someone's number.
  if (value.trim().startsWith("+") && !/^\+1/.test(value.trim())) return value;

  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`;
  return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/** Whether the value holds a complete 10-digit US number. */
export function isCompletePhone(value: string): boolean {
  return phoneDigits(value).length === 10;
}
