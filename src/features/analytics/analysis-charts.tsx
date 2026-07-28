"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatArs } from "@/lib/formatters/currency";

export type DistributionItem = {
  id: string;
  name: string;
  amountCents: number;
  color: string;
};

export function DistributionChart({
  data,
  totalCents,
}: {
  data: readonly DistributionItem[];
  totalCents: number;
}) {
  return (
    <div className="relative mx-auto h-[210px] w-[210px]">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amountCents"
            animationDuration={350}
            innerRadius={66}
            isAnimationActive
            nameKey="name"
            outerRadius={86}
            paddingAngle={0}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell fill={entry.color} key={entry.id} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatArs(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-xs text-[var(--muted)]">Total</p>
          <p className="numeric mt-1 text-[20px] font-bold">
            {formatArs(totalCents)}
          </p>
        </div>
      </div>
    </div>
  );
}
