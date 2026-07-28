import Link from "next/link";

export function TopHeader() {
  return (
    <header className="-mx-5 flex h-14 items-center justify-center border-b px-5 hairline">
      <Link
        className="min-h-11 content-center text-center text-[22px] font-bold tracking-[-0.08em]"
        href="/"
      >
        austral
      </Link>
    </header>
  );
}
