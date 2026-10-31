"use client";

import { LoaderCircle } from "lucide-react";
import { moneyMotionStyles as styles } from "./motion-scope";

export function ConfirmMark({ state }: { state: "pending" | "confirmed" }) {
  return (
    <div className="relative flex size-12 items-center justify-center rounded-full bg-muted" data-slot="confirm-mark" data-state={state}>
      {state === "pending" ? (
        <LoaderCircle aria-hidden="true" className="size-6 text-muted-foreground motion-safe:animate-spin" />
      ) : (
        <>
          <LoaderCircle aria-hidden="true" className={`absolute size-6 text-muted-foreground ${styles.spinnerOut}`} />
          <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-6 text-foreground ${styles.bubble}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle className={styles.checkRing} cx="12" cy="12" r="10" pathLength={1} transform="rotate(-90 12 12)" />
            <path className={styles.checkTick} d="m9 12 2 2 4-4" pathLength={1} />
          </svg>
        </>
      )}
    </div>
  );
}

export function ConfirmHeader({ state, pendingTitle, confirmedTitle, pendingDescription }: {
  state: "pending" | "confirmed";
  pendingTitle: string;
  confirmedTitle: string;
  pendingDescription?: string;
}) {
  const confirmed = state === "confirmed";
  return (
    <div role="status" aria-atomic="true" className="flex flex-col items-center gap-4 text-center">
      <ConfirmMark state={state} />
      <div key={state} className={`flex max-w-xs flex-col items-center gap-1 ${confirmed ? styles.titleIn : ""}`}>
        <h3 className={`text-base font-semibold ${confirmed ? "text-foreground" : "text-muted-foreground"}`}>
          {confirmed ? confirmedTitle : pendingTitle}
        </h3>
        {!confirmed && pendingDescription ? <p className="text-sm text-muted-foreground">{pendingDescription}</p> : null}
      </div>
    </div>
  );
}
