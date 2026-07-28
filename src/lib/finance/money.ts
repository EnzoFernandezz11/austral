const AMOUNT_PATTERN = /^\d+(?:[.,]\d{0,2})?$/;

export function parseAmountToCents(input: string): number | null {
  const normalized = input.trim();
  if (!AMOUNT_PATTERN.test(normalized)) {
    return null;
  }

  const [units = "", decimals = ""] = normalized.replace(",", ".").split(".");
  const centsText = `${units}${decimals.padEnd(2, "0")}`;
  const cents = Number(centsText);

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return null;
  }

  return cents;
}
