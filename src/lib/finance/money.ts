const PLAIN_AMOUNT_PATTERN = /^\d+$/;
const GROUPED_AMOUNT_PATTERN = /^\d{1,3}(?:\.\d{3})+$/;
const COMMA_DECIMAL_PATTERN = /^(?:\d+|\d{1,3}(?:\.\d{3})+),(\d{0,2})$/;
const DOT_DECIMAL_PATTERN = /^\d+\.(\d{0,2})$/;

function groupThousands(units: string): string {
  const normalized = units.replace(/^0+(?=\d)/, "") || "0";
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatAmountInput(input: string): string {
  const cleaned = input.replace(/[^\d.,]/g, "");
  if (cleaned === "") {
    return "";
  }

  const commaIndex = cleaned.indexOf(",");
  const hasComma = commaIndex !== -1;
  const dotIndexes = [...cleaned.matchAll(/\./g)];
  const singleDot = dotIndexes.length === 1 ? dotIndexes[0]?.index : undefined;
  const dotLooksDecimal =
    !hasComma && singleDot !== undefined && cleaned.length - singleDot - 1 <= 2;
  const decimalIndex = hasComma ? commaIndex : dotLooksDecimal ? singleDot : -1;
  const integerSource =
    decimalIndex === -1 ? cleaned : cleaned.slice(0, decimalIndex);
  const decimalSource =
    decimalIndex === -1 ? "" : cleaned.slice(decimalIndex + 1);
  const units = integerSource.replace(/\D/g, "") || "0";
  const decimals = decimalSource.replace(/\D/g, "").slice(0, 2);

  return `${groupThousands(units)}${decimalIndex === -1 ? "" : `,${decimals}`}`;
}

export function formatCentsForInput(amountCents: number): string {
  const units = Math.floor(amountCents / 100);
  const cents = amountCents % 100;
  return `${groupThousands(String(units))}${
    cents === 0 ? "" : `,${String(cents).padStart(2, "0")}`
  }`;
}

export function parseAmountToCents(input: string): number | null {
  const normalized = input.trim();
  let unitsText: string;
  let decimals = "";

  const commaMatch = COMMA_DECIMAL_PATTERN.exec(normalized);
  const dotMatch = DOT_DECIMAL_PATTERN.exec(normalized);
  if (commaMatch !== null) {
    const [integerPart = ""] = normalized.split(",");
    unitsText = integerPart.replaceAll(".", "");
    decimals = commaMatch[1] ?? "";
  } else if (dotMatch !== null && !GROUPED_AMOUNT_PATTERN.test(normalized)) {
    const [integerPart = ""] = normalized.split(".");
    unitsText = integerPart;
    decimals = dotMatch[1] ?? "";
  } else if (
    PLAIN_AMOUNT_PATTERN.test(normalized) ||
    GROUPED_AMOUNT_PATTERN.test(normalized)
  ) {
    unitsText = normalized.replaceAll(".", "");
  } else {
    return null;
  }

  const centsText = `${unitsText}${decimals.padEnd(2, "0")}`;
  const cents = Number(centsText);

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return null;
  }

  return cents;
}
