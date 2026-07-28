import type { Metadata } from "next";
import { QuickExpenseScreen } from "@/features/transactions/quick-expense-screen";

export const metadata: Metadata = {
  title: "Anotar gasto",
  manifest: "/manifest-nuevo.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anotar gasto",
  },
  icons: {
    icon: [
      {
        url: "/icons/quick-expense-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/quick-expense-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/quick-expense-apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function QuickExpensePage() {
  return <QuickExpenseScreen />;
}
