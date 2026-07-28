import { describe, expect, it } from "vitest";
import { parseAmountToCents } from "@/lib/finance/money";

describe("parseAmountToCents", () => {
  it("convierte coma o punto decimal sin cálculos con float", () => {
    expect(parseAmountToCents("1234,56")).toBe(123_456);
    expect(parseAmountToCents("10.5")).toBe(1_050);
    expect(parseAmountToCents("75")).toBe(7_500);
  });

  it("rechaza cero, negativos y más de dos decimales", () => {
    expect(parseAmountToCents("0")).toBeNull();
    expect(parseAmountToCents("-10")).toBeNull();
    expect(parseAmountToCents("1,234")).toBeNull();
  });
});
