import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AppProvider } from "@/features/settings/app-provider";
import { AppShell } from "@/components/app-shell";
import { PwaManager } from "@/components/pwa-manager";

export const metadata: Metadata = {
  title: {
    default: "Austral",
    template: "%s · Austral",
  },
  description: "Control financiero personal, privado y local-first.",
  applicationName: "Austral",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Austral",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <PwaManager />
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
