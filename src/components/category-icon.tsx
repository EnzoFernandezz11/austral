import {
  Bus,
  CircleDollarSign,
  Dumbbell,
  Ellipsis,
  GraduationCap,
  HandHeart,
  HeartPulse,
  House,
  Laptop,
  PartyPopper,
  Shirt,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const ICONS: Readonly<Record<string, LucideIcon>> = {
  Bus,
  CircleDollarSign,
  Dumbbell,
  Ellipsis,
  GraduationCap,
  HandHeart,
  HeartPulse,
  House,
  Laptop,
  PartyPopper,
  Shirt,
  Utensils,
};

export function CategoryIcon({
  name,
  income = false,
  size = "normal",
}: {
  name: string;
  income?: boolean;
  size?: "normal" | "small";
}) {
  const Icon = ICONS[name] ?? Ellipsis;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${
        size === "small" ? "size-8" : "size-10"
      } ${income ? "bg-[#e7f2ed] text-[var(--income)]" : "bg-[#f2f1ed] text-[var(--navy)]"}`}
    >
      <Icon
        aria-hidden="true"
        size={size === "small" ? 15 : 18}
        strokeWidth={1.8}
      />
    </span>
  );
}
