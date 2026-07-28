"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
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
            innerRadius={66}
            isAnimationActive={false}
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

export function TrendChart({
  data,
}: {
  data: readonly { day: string; amountCents: number }[];
}) {
  return (
    <div className="mt-3 h-36">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart
          data={data}
          margin={{ bottom: 4, left: 2, right: 2, top: 8 }}
        >
          <Tooltip
            formatter={(value) => formatArs(Number(value))}
            labelFormatter={(label) => `Día ${String(label)}`}
          />
          <Area
            dataKey="amountCents"
            fill="#edf2f5"
            fillOpacity={1}
            isAnimationActive={false}
            stroke="var(--navy)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
