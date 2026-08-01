"use client";

import { useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import { formatAmountInput } from "@/lib/finance/money";

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  onValueChange: (value: string) => void;
  value: string;
  variant?: "field" | "hero";
};

function countInputTokens(value: string): number {
  return [...value].filter((character) => /[\d,]/.test(character)).length;
}

function caretForTokenCount(value: string, tokenCount: number): number {
  if (tokenCount === 0) {
    return 0;
  }

  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/[\d,]/.test(value[index] ?? "")) {
      seen += 1;
      if (seen === tokenCount) {
        return index + 1;
      }
    }
  }
  return value.length;
}

export function MoneyInput({
  onValueChange,
  value,
  variant = "field",
  className = "",
  ...inputProps
}: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const rawCaret = event.target.selectionStart ?? rawValue.length;
    const tokensBeforeCaret = countInputTokens(rawValue.slice(0, rawCaret));
    const inputType =
      event.nativeEvent instanceof InputEvent
        ? event.nativeEvent.inputType
        : "";
    const deletingGroupedInteger =
      inputType.startsWith("delete") &&
      value.includes(".") &&
      !value.includes(",") &&
      !rawValue.includes(",");
    const formatted = formatAmountInput(
      deletingGroupedInteger ? rawValue.replaceAll(".", "") : rawValue,
    );
    const wasAtEnd = rawCaret === rawValue.length;
    onValueChange(formatted);

    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input === null || document.activeElement !== input) {
        return;
      }
      const nextCaret = wasAtEnd
        ? formatted.length
        : caretForTokenCount(formatted, tokensBeforeCaret);
      input.setSelectionRange(nextCaret, nextCaret);
    });
  };

  if (variant === "hero") {
    const sizeClass =
      value.length <= 9
        ? "text-[42px]"
        : value.length <= 14
          ? "text-[34px]"
          : "text-[25px]";
    const visualLength = Math.max(value.length, 1);

    return (
      <div className="mx-auto flex max-w-full items-center justify-center gap-2">
        <span className={`numeric font-bold ${sizeClass}`} aria-hidden="true">
          $
        </span>
        <input
          {...inputProps}
          autoComplete="off"
          className={`quick-amount numeric min-w-[1ch] max-w-[calc(100%_-_42px)] bg-transparent text-left font-bold outline-none placeholder:text-black ${sizeClass} ${className}`}
          inputMode="decimal"
          onChange={handleChange}
          ref={inputRef}
          style={{ width: `${visualLength}ch` }}
          type="text"
          value={value}
        />
      </div>
    );
  }

  return (
    <input
      {...inputProps}
      autoComplete="off"
      className={`field ${className}`}
      inputMode="decimal"
      onChange={handleChange}
      ref={inputRef}
      type="text"
      value={value}
    />
  );
}
