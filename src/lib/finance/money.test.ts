import { describe, expect, it } from "vitest";
import {
  formatAmountInput,
  formatCentsForInput,
  parseAmountToCents,
} from "@/lib/finance/money";

describe("parseAmountToCents", () => {
  it("convierte coma o punto decimal sin cálculos con float", () => {
    expect(parseAmountToCents("1234,56")).toBe(123_456);
    expect(parseAmountToCents("10.5")).toBe(1_050);
    expect(parseAmountToCents("75")).toBe(7_500);
    expect(parseAmountToCents("3.000.000")).toBe(300_000_000);
    expect(parseAmountToCents("1.250,50")).toBe(125_050);
  });

  it("rechaza cero, negativos y más de dos decimales", () => {
    expect(parseAmountToCents("0")).toBeNull();
    expect(parseAmountToCents("-10")).toBeNull();
    expect(parseAmountToCents("1,234")).toBeNull();
  });

  it("formatea miles y centavos mientras se escribe", () => {
    expect(formatAmountInput("3000000")).toBe("3.000.000");
    expect(formatAmountInput("1.250,50")).toBe("1.250,50");
    expect(formatAmountInput("10.")).toBe("10,");
    expect(formatAmountInput("0001250,5")).toBe("1.250,5");
  });

  it("convierte montos guardados a una entrada localizada", () => {
    expect(formatCentsForInput(300_000_000)).toBe("3.000.000");
    expect(formatCentsForInput(125_050)).toBe("1.250,50");
  });

  it("rechaza agrupaciones inválidas y montos fuera del rango seguro", () => {
    expect(parseAmountToCents("12.34.567")).toBeNull();
    expect(parseAmountToCents("999999999999999999999")).toBeNull();
  });
});
