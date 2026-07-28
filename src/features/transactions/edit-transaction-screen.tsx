"use client";

import { PageHeading } from "@/components/page-heading";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/screen-state";
import { useAppData } from "@/features/settings/app-provider";
import { TransactionForm } from "@/features/transactions/transaction-form";

export function EditTransactionScreen({ id }: { id: string }) {
  const { status, error, transactions } = useAppData();

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? "Error desconocido"} />;
  }

  const transaction = transactions.find((item) => item.id === id);
  if (transaction === undefined) {
    return (
      <EmptyState
        description="Puede haber sido eliminado o no existir en este dispositivo."
        title="Movimiento no encontrado"
      />
    );
  }

  return (
    <div className="screen pt-7">
      <PageHeading title="Editar movimiento" />
      <TransactionForm transaction={transaction} />
    </div>
  );
}
