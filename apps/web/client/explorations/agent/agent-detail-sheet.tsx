"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupOption } from "@/components/ui/radio-group";
import { ManagementFacts } from "@/components/management-facts";
import { MoneyModal, MoneyModalBody, MoneyModalFooter, MoneyModalHeader } from "@/client/money-modal";
import { describeLimits, usd } from "./agent-limits";
import type { HomeAgent } from "./agent-fixtures";

const asking = { every: "Before every trade", over: "Only over $25", never: "Never, within its limits" } as const;
type Asking = keyof typeof asking;

function askingOf(agent: HomeAgent): Asking {
  return agent.limits.askOver === 0 ? "every" : agent.limits.askOver === null ? "never" : "over";
}

export function AgentDetailSheet({ open, agent, onClose, onChange, onEditLimits }: {
  open: boolean;
  agent: HomeAgent;
  onClose: () => void;
  onChange: (agent: HomeAgent) => void;
  onEditLimits: () => void;
}) {
  const titleId = "agent-detail-title";
  return (
    <MoneyModal open={open} labelledBy={titleId} onCancel={onClose} onClose={() => undefined}>
      <MoneyModalHeader title={agent.name} titleId={titleId} />
      <MoneyModalBody hasFooter className="gap-5 pt-2">
        <div className="space-y-1 text-center">
          <p className="text-4xl font-semibold tabular-nums">{agent.readOnly ? "Reads only" : usd(Number(agent.portfolio))}</p>
          <p className="text-sm text-muted-foreground">{agent.paused ? "Paused. It can't trade until you resume it." : `You asked: “${agent.goal}”`}</p>
        </div>

        {agent.readOnly ? (
          <p className="text-sm text-muted-foreground">This agent can see your balances and prices. It has no portfolio and can&apos;t trade.</p>
        ) : <>
          <section aria-labelledby="agent-detail-limits" className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 id="agent-detail-limits" className="text-sm font-medium">Limits</h3>
              <Button variant="ghost" size="sm" onClick={onEditLimits}>Edit</Button>
            </div>
            <ManagementFacts rows={describeLimits(agent.limits).filter(([label]) => label !== "Asks you")} />
          </section>

          <section aria-labelledby="agent-detail-asking" className="space-y-2">
            <h3 id="agent-detail-asking" className="text-sm font-medium">Asks you</h3>
            <RadioGroup aria-labelledby="agent-detail-asking" value={askingOf(agent)} onValueChange={(value) => {
              const askOver = value === "every" ? 0 : value === "never" ? null : 25;
              onChange({ ...agent, limits: { ...agent.limits, askOver } });
            }}>
              {(Object.keys(asking) as Asking[]).map((key) => <RadioGroupOption key={key} value={key} label={asking[key]} />)}
            </RadioGroup>
          </section>
        </>}

        <Button variant="outline" size="touch" className="w-full" onClick={() => onChange({ ...agent, paused: !agent.paused })}>{agent.paused ? "Resume agent" : "Pause agent"}</Button>
      </MoneyModalBody>
      <MoneyModalFooter primaryLabel="Done" onPrimary={onClose} />
    </MoneyModal>
  );
}
