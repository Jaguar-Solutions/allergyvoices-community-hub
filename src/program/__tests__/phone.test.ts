import { describe, expect, it } from "vitest";

import { formatPhone, isCompletePhone, phoneDigits } from "../phone";

describe("formatPhone", () => {
  it("formats a complete number", () => {
    expect(formatPhone("9195550100")).toBe("(919)555-0100");
  });

  it("formats progressively as it is typed", () => {
    expect(formatPhone("9")).toBe("(9");
    expect(formatPhone("919")).toBe("(919");
    expect(formatPhone("9195")).toBe("(919)5");
    expect(formatPhone("919555")).toBe("(919)555");
    expect(formatPhone("9195550")).toBe("(919)555-0");
  });

  it("normalizes however a restaurant types it", () => {
    for (const input of [
      "919.555.0100",
      "919-555-0100",
      "919 555 0100",
      "(919) 555-0100",
      "+1 919 555 0100",
      "1-919-555-0100",
    ]) {
      expect(formatPhone(input), input).toBe("(919)555-0100");
    }
  });

  it("is stable when re-applied to its own output", () => {
    // The field formats on every keystroke, so formatting an already
    // formatted value must not drift.
    const once = formatPhone("9195550100");
    expect(formatPhone(once)).toBe(once);
  });

  it("ignores extra digits rather than shifting the mask", () => {
    expect(formatPhone("91955501009999")).toBe("(919)555-0100");
  });

  it("is empty for an empty value", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("abc")).toBe("");
  });

  /**
   * A US mask must not quietly mangle a number that isn't US — truncating an
   * international number to ten digits would store a number that dials
   * somewhere else entirely.
   */
  it("leaves a non-US international number alone", () => {
    expect(formatPhone("+44 20 7946 0958")).toBe("+44 20 7946 0958");
  });
});

describe("isCompletePhone", () => {
  it("accepts ten digits however they are punctuated", () => {
    expect(isCompletePhone("(919)555-0100")).toBe(true);
    expect(isCompletePhone("9195550100")).toBe(true);
    expect(isCompletePhone("+1 919 555 0100")).toBe(true);
  });

  it("rejects an incomplete number", () => {
    expect(isCompletePhone("(919)555-01")).toBe(false);
    expect(isCompletePhone("")).toBe(false);
  });
});

describe("phoneDigits", () => {
  it("drops a leading US country code", () => {
    expect(phoneDigits("+1 (919) 555-0100")).toBe("9195550100");
  });
});
