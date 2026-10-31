"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { useReducedMotion } from "@/components/money-ticker";
import { moneyMotion } from "./tokens";

const usd: Format = { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 };

export function RollingAmount({
  value,
  format = usd,
  pace = "roll",
  trend,
  className,
}: {
  value: number;
  format?: Format;
  pace?: "roll" | "tick";
  trend?: 1 | 0 | -1;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const duration = moneyMotion.duration[pace];
  const easing = pace === "roll" ? moneyMotion.ease.settle : moneyMotion.ease.standard;
  return (
    <NumberFlow
      className={["tabular-nums", className].filter(Boolean).join(" ")}
      value={value}
      locales="en-US"
      format={format}
      animated={!reduced}
      respectMotionPreference={false}
      trend={trend ?? ((oldValue, newValue) => Math.sign(newValue - oldValue))}
      transformTiming={{ duration, easing }}
      spinTiming={{ duration, easing }}
      opacityTiming={{ duration: moneyMotion.duration.fade, easing: moneyMotion.ease.enter }}
      data-slot="rolling-amount"
    />
  );
}
