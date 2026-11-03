"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ManagementFacts } from "@/components/management-facts";
import { MoneyModal, MoneyModalBody, MoneyModalFooter, MoneyModalHeader } from "@/client/money-modal";
import { useHomeToast } from "@/client/home/use-home-toast";
import { formatFiatAmount } from "@/shared/formatting";
import type { AgentProposal, AgentRequest } from "./agent-fixtures";

const usd = (value: string | number) => formatFiatAmount(String(value), "USD", { currencyNative: true });

export function blockReason(proposal: AgentProposal, request: AgentRequest, included: AgentProposal[]) {
  if (proposal.blocked) return proposal.blocked;
  if (proposal.side !== "buy") return null;
  const before = included.filter((p) => p.side === "buy" && p.id !== proposal.id && !p.blocked).reduce((sum, p) => sum + Number(p.usd), 0);
  const left = Number(request.limits.dailyLeft) - before;
  return Number(proposal.usd) > left ? `Over today's limit. ${usd(Math.max(0, left))} left.` : null;
}

export function AgentReviewSheet({ open, request, onClose, onApproved }: { open: boolean; request: AgentRequest; onClose: () => void; onApproved?: () => void }) {
  const [off, setOff] = useState<string[]>([]);
  const { add } = useHomeToast(null);
  const blocked = Object.fromEntries(request.proposals.map((p) => [p.id, blockReason(p, request, request.proposals.filter((x) => !off.includes(x.id)))]));
  const approved = request.proposals.filter((p) => !blocked[p.id] && !off.includes(p.id));
  const net = approved.reduce((sum, p) => sum + (p.side === "buy" ? -1 : 1) * Number(p.usd), 0);
  const count = approved.length;

  function approve() {
    onApproved?.();
    onClose();
    add({ message: `Approved ${count} ${count === 1 ? "trade" : "trades"}. ${request.agent} is placing ${count === 1 ? "it" : "them"}.`, tone: "neutral", role: "status" });
  }

  return (
    <MoneyModal open={open} labelledBy="agent-review-title" onCancel={onClose} onClose={() => setOff([])}>
      <MoneyModalHeader title="Review trades" titleId="agent-review-title" />
      <MoneyModalBody hasFooter className="gap-4 pt-2">
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium">{request.agent}</p>
          <p className="text-sm text-muted-foreground">You asked: “{request.asked}”</p>
        </div>

        <Card variant="flush" className="shrink-0"><CardContent inset="list"><ul aria-label="Proposed trades">
          {request.proposals.map((p) => {
            const reason = blocked[p.id];
            const on = !reason && !off.includes(p.id);
            const label = `${p.side === "buy" ? "Buy" : "Sell"} ${p.asset}`;
            return (
              <li key={p.id} data-proposal={p.id} className="flex min-h-14 items-center gap-3 px-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className={reason || !on ? "font-medium text-muted-foreground" : "font-medium"}>{label}</p>
                  <p className="text-muted-foreground">{reason ?? p.reason}</p>
                </div>
                <div className="text-end tabular-nums">
                  <p className={reason || !on ? "text-muted-foreground line-through" : "font-medium"}><bdi dir="ltr">{usd(p.usd)}</bdi></p>
                  {p.units ? <p className="text-muted-foreground"><bdi dir="ltr">{p.units}</bdi></p> : null}
                </div>
                {reason ? <Lock className="size-4 shrink-0 text-muted-foreground" aria-label="Not allowed" /> : (
                  <Switch checked={on} aria-label={`Include ${label}`} onCheckedChange={(checked) => setOff((current) => checked ? current.filter((id) => id !== p.id) : [...current, p.id])} />
                )}
              </li>
            );
          })}
        </ul></CardContent></Card>

        <ManagementFacts rows={[[net < 0 ? "From Cash" : "To Cash", usd(Math.abs(net))]]} />

        <section aria-labelledby="agent-limits-title" className="space-y-1">
          <h3 id="agent-limits-title" className="text-sm font-medium">Limits</h3>
          <ManagementFacts rows={[
            ["Left today", `${usd(request.limits.dailyLeft)} of ${usd(request.limits.dailyLimit)}`],
            ["Can trade", request.limits.assets.join(", ")],
            ["Asks you", "Before every trade"],
          ]} />
          <p className="text-sm text-muted-foreground">Only you can change these. The agent can&apos;t.</p>
        </section>
      </MoneyModalBody>
      <MoneyModalFooter primaryLabel={count ? `Approve ${count} ${count === 1 ? "trade" : "trades"}` : "Approve"} primaryDisabled={!count} onPrimary={approve} secondaryLabel="Not now" onSecondary={onClose} />
    </MoneyModal>
  );
}
