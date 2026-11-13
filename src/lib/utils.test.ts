import { describe, expect, it } from "vitest";
import { cn, getInitials } from "@/lib/utils";

describe("getInitials", () => {
  it("uses the first and last initials from a name", () => {
    expect(getInitials("Jordan Lee")).toBe("JL");
    expect(getInitials("  Ada   Lovelace Byron ")).toBe("AL");
  });

  it("returns a safe fallback for missing names", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials(undefined)).toBe("?");
  });
});

describe("cn", () => {
  it("joins conditional classes and lets later Tailwind utilities win", () => {
    expect(cn("rounded px-2", false && "hidden", "px-5")).toBe("rounded px-5");
  });
});
