import type { AppSettings, Category } from "@/types/finance";

export const CURRENT_SCHEMA_VERSION = 2;

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  preferredCurrency: "ARS",
  theme: "light",
};

export const DEFAULT_CATEGORIES: readonly Category[] = [
  {
    id: "expense-food",
    name: "Comida",
    icon: "Utensils",
    color: "#e76f51",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-going-out",
    name: "Salidas",
    icon: "PartyPopper",
    color: "#f4a261",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-gym",
    name: "Gimnasio",
    icon: "Dumbbell",
    color: "#2a9d8f",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-transport",
    name: "Transporte",
    icon: "Bus",
    color: "#457b9d",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-health",
    name: "Salud",
    icon: "HeartPulse",
    color: "#e63946",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-clothing",
    name: "Ropa",
    icon: "Shirt",
    color: "#9b5de5",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-home",
    name: "Hogar",
    icon: "House",
    color: "#588157",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-technology",
    name: "Tecnología y proyectos",
    icon: "Laptop",
    color: "#3a86ff",
    type: "expense",
    isDefault: true,
  },
  {
    id: "expense-other",
    name: "Otros",
    icon: "Ellipsis",
    color: "#6c757d",
    type: "expense",
    isDefault: true,
  },
  {
    id: "income-scholarship",
    name: "Beca",
    icon: "GraduationCap",
    color: "#2a9d8f",
    type: "income",
    isDefault: true,
  },
  {
    id: "income-family",
    name: "Ayuda familiar",
    icon: "HandHeart",
    color: "#52b788",
    type: "income",
    isDefault: true,
  },
  {
    id: "income-other",
    name: "Otros ingresos",
    icon: "CircleDollarSign",
    color: "#40916c",
    type: "income",
    isDefault: true,
  },
] as const;
