import Link from "next/link";
import { Menu, Settings } from "lucide-react";

export function TopHeader() {
  return (
    <header className="-mx-5 flex h-14 items-center justify-between border-b px-5 hairline">
      <button
        aria-label="Abrir menú"
        className="grid size-11 place-items-center"
        type="button"
      >
        <Menu aria-hidden="true" size={19} strokeWidth={1.7} />
      </button>
      <Link
        className="min-h-11 content-center text-center text-[22px] font-bold tracking-[-0.08em]"
        href="/"
      >
        austral
      </Link>
      <Link
        aria-label="Abrir ajustes"
        className="grid size-11 place-items-center"
        href="/settings"
      >
        <Settings aria-hidden="true" size={19} strokeWidth={1.7} />
      </Link>
    </header>
  );
}
