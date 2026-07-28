"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  House,
  List,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAVIGATION: readonly NavigationItem[] = [
  { href: "/", label: "Inicio", icon: House, exact: true },
  { href: "/history", label: "Movimientos", icon: List },
  { href: "/analytics", label: "Análisis", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

function isActive(pathname: string, item: NavigationItem): boolean {
  if (item.href === "/history" && pathname.startsWith("/transactions/")) {
    return true;
  }
  return item.exact === true
    ? pathname === item.href
    : pathname.startsWith(item.href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="phone-frame">
      <main className="app-scroll">{children}</main>
      <nav
        aria-label="Navegación principal"
        className="relative z-30 grid h-[72px] shrink-0 grid-cols-5 border-t bg-[var(--paper)] pb-[max(env(safe-area-inset-bottom),4px)] hairline"
      >
        {NAVIGATION.slice(0, 2).map((item) => (
          <NavigationLink
            active={isActive(pathname, item)}
            item={item}
            key={item.href}
          />
        ))}

        <Link
          aria-label="Agregar movimiento"
          className="flex min-h-11 flex-col items-center justify-start text-[9px] font-medium"
          href="/nuevo"
        >
          <span className="-mt-3 grid size-12 place-items-center rounded-full bg-black text-white shadow-md">
            <Plus aria-hidden="true" size={25} strokeWidth={1.7} />
          </span>
        </Link>

        {NAVIGATION.slice(2).map((item) => (
          <NavigationLink
            active={isActive(pathname, item)}
            item={item}
            key={item.href}
          />
        ))}
      </nav>
    </div>
  );
}

function NavigationLink({
  item,
  active,
}: {
  item: NavigationItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 flex-col items-center justify-center gap-1 text-[9px] font-medium ${
        active ? "text-[var(--navy)]" : "text-[#596065]"
      }`}
      href={item.href}
    >
      <Icon
        aria-hidden="true"
        fill={active && item.href === "/" ? "currentColor" : "none"}
        size={18}
        strokeWidth={active ? 2.3 : 1.8}
      />
      {item.label}
    </Link>
  );
}
