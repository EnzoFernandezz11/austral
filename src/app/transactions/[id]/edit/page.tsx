import type { Metadata } from "next";
import { EditTransactionScreen } from "@/features/transactions/edit-transaction-screen";

export const metadata: Metadata = { title: "Editar movimiento" };

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTransactionScreen id={id} />;
}
