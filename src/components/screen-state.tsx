import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      className="grid min-h-[55vh] place-items-center text-sm text-[var(--muted)]"
      role="status"
    >
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="mx-5 mt-8 flex gap-3 rounded-xl border border-red-200 p-4 text-red-900"
      role="alert"
    >
      <AlertTriangle aria-hidden="true" className="shrink-0" size={19} />
      <div>
        <p className="font-semibold">No pudimos cargar los datos</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[52vh] place-items-center text-center">
      <div>
        <p className="text-sm">{title}</p>
        <p className="mt-1 text-sm">{description}</p>
        <div className="mt-5">
          {action ?? (
            <Link className="button-black" href="/nuevo">
              + Agregar movimiento
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
