import type { MonthSelection } from "@/types/finance";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonth(month: MonthSelection): string {
  return `${MONTH_NAMES[month.monthIndex] ?? ""} ${month.year}`;
}

export function formatLocalDate(value: string): string {
  const [yearText = "1970", monthText = "01", dayText = "01"] =
    value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  return dateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatRelativeLocalDate(value: string): string {
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (value === todayValue) {
    return "Hoy";
  }

  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const yesterdayValue = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1,
  ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  return value === yesterdayValue ? "Ayer" : formatLocalDate(value);
}
