"use client";

import { useEffect, useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribeToConnection(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getConnectionSnapshot(): boolean {
  return !navigator.onLine;
}

function getServerConnectionSnapshot(): boolean {
  return false;
}

export function PwaManager() {
  const offline = useSyncExternalStore(
    subscribeToConnection,
    getConnectionSnapshot,
    getServerConnectionSnapshot,
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return offline ? (
    <div
      className="fixed left-1/2 top-[max(env(safe-area-inset-top),0.5rem)] z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-medium text-white shadow-lg"
      role="status"
    >
      <WifiOff aria-hidden="true" size={14} />
      Sin conexión · tus cambios se guardan en este dispositivo
    </div>
  ) : null;
}
