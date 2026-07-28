import Link from "next/link";
import { EmptyState } from "@/components/screen-state";

export default function NotFound() {
  return (
    <EmptyState
      action={
        <Link className="button-outline" href="/">
          Volver al resumen
        </Link>
      }
      description="La dirección solicitada no existe."
      title="Página no encontrada"
    />
  );
}
