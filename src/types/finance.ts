export type TransactionType = "expense" | "income";

export type Transaction = {
  id: string;
  type: TransactionType;
  amountCents: number;
  currency: "ARS";
  categoryId: string;
  note?: string | undefined;
  occurredOn: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionDraft = {
  type: TransactionType;
  amountCents: number;
  categoryId: string;
  note?: string | undefined;
  occurredOn: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | "both";
  isDefault: boolean;
};

export type AppSettings = {
  schemaVersion: number;
  monthlyBudgetCents?: number | undefined;
  preferredCurrency: "ARS";
  theme: "light";
};

export type FinanceSnapshot = {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
};

export type MonthSelection = {
  year: number;
  monthIndex: number;
};
