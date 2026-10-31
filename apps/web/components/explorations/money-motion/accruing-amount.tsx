"use client";

import { useEffect, useState } from "react";
import { RollingAmount } from "./rolling-amount";

const secondsPerYear = 365 * 24 * 60 * 60;
const microUsd = { style: "currency", currency: "USD", minimumFractionDigits: 6, maximumFractionDigits: 6 } as const;
const centsUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function accruedInterest(principal: number, apy: number, elapsedSeconds: number) {
  return principal * (Math.pow(1 + apy, elapsedSeconds / secondsPerYear) - 1);
}

export function AccruingAmount({ principal, apy, earnedBefore = 0, startedAt, cadenceMs = 1000 }: {
  principal: number;
  apy: number;
  earnedBefore?: number;
  startedAt: number;
  cadenceMs?: number;
}) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer || document.hidden) return;
      timer = setInterval(() => setNow(Date.now()), cadenceMs);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        setNow(Date.now());
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cadenceMs]);
  const earned = earnedBefore + accruedInterest(principal, apy, Math.max(0, now - startedAt) / 1000);
  return (
    <span className="inline-flex items-baseline" data-slot="accruing-amount">
      <span className="sr-only">{centsUsd.format(earned)}</span>
      <span aria-hidden="true">
        <RollingAmount value={earned} format={microUsd} pace="tick" trend={1} />
      </span>
    </span>
  );
}
