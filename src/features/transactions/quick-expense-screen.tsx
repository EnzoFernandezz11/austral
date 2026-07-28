"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/screen-state";
import { useAppData } from "@/features/settings/app-provider";
import { QuickExpenseForm } from "@/features/transactions/quick-expense-form";

export function QuickExpenseScreen() {
  const { status, error } = useAppData();

  if (status === "loading") {
    return <LoadingState label="Preparando el registro…" />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? "Error desconocido"} />;
  }

  return (
    <div className="screen pb-4">
      <header className="-mx-5 grid h-14 grid-cols-[56px_1fr_56px] items-center border-b px-1 hairline">
        <Link
          aria-label="Volver a Inicio"
          className="grid size-11 place-items-center justify-self-center"
          href="/"
        >
          <ArrowLeft aria-hidden="true" size={19} />
        </Link>
        <h1 className="text-center text-[16px] font-semibold">
          Nuevo movimiento
        </h1>
      </header>
      <QuickExpenseForm />
    </div>
  );
}
