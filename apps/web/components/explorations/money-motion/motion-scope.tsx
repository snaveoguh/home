"use client";

import type { ReactNode } from "react";
import { MoneyMotionProvider, useReducedMotion } from "@/components/money-ticker";
import styles from "./money-motion.module.css";
import type { MoneyMotionMode } from "./tokens";

export function MoneyMotionScope({ mode = "system", children }: { mode?: MoneyMotionMode; children?: ReactNode }) {
  return (
    <MoneyMotionProvider reducedMotion={mode === "reduce" ? true : undefined}>
      <ScopeRoot>{children}</ScopeRoot>
    </MoneyMotionProvider>
  );
}

function ScopeRoot({ children }: { children?: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <div className={[styles.root, reduced ? styles.reduced : ""].join(" ")} data-money-motion={reduced ? "reduce" : "full"}>
      {children}
    </div>
  );
}

export { styles as moneyMotionStyles };
