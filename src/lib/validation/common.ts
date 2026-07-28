import { z } from "zod";

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealLocalDate(value: string): boolean {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export const localDateSchema = z
  .string()
  .regex(LOCAL_DATE_PATTERN, "La fecha debe tener formato YYYY-MM-DD")
  .refine(isRealLocalDate, "La fecha no es válida");

export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: "La fecha y hora ISO no es válida" });

export const amountCentsSchema = z
  .number()
  .int("El monto debe ser un entero en centavos")
  .positive("El monto debe ser mayor a cero")
  .safe("El monto está fuera del rango permitido");
