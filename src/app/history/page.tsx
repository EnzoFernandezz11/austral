import type { Metadata } from "next";
import { HistoryScreen } from "@/features/transactions/history-screen";

export const metadata: Metadata = { title: "Historial" };

export default function HistoryPage() {
  return <HistoryScreen />;
}
