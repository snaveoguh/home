"use client";

import { useState } from "react";
import { formatFiatAmount } from "@/shared/formatting";
import { RollingAmount } from "./rolling-amount";
import { moneyMotionStyles as styles } from "./motion-scope";

function signedUsd(delta: number) {
  return formatFiatAmount(BigInt(Math.round(delta * 100)), 2, "USD", { currencyNative: true, sign: "always" });
}

export function BalanceUpdate({ value, label = "Total balance" }: { value: number; label?: string }) {
  const [shown, setShown] = useState({ value, delta: 0, change: 0 });
  if (shown.value !== value) setShown({ value, delta: value - shown.value, change: shown.change + 1 });
  return (
    <div className="flex flex-col gap-1" data-slot="balance-update">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-4xl font-semibold">
        <RollingAmount value={value} />
      </div>
      <p className="h-5 text-sm text-muted-foreground" aria-live="polite">
        {shown.change > 0 ? (
          <span key={shown.change} className={`inline-block ${styles.delta}`}>
            {signedUsd(shown.delta)}
          </span>
        ) : null}
      </p>
    </div>
  );
}
