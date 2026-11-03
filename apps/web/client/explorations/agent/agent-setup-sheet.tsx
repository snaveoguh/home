"use client";

import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ManagementFacts } from "@/components/management-facts";
import { MoneyModal, MoneyModalBody, MoneyModalFooter, MoneyModalHeader } from "@/client/money-modal";
import { useHomeToast } from "@/client/home/use-home-toast";
import { DEFAULT_LIMITS, describeLimits, parseLimits, type AgentLimitSpec } from "./agent-limits";

export type AgentDraft = { name: string; goal: string; limits: AgentLimitSpec };

export function AgentSetupSheet({ open, initial, onClose, onSave }: {
  open: boolean;
  initial?: { name: string; goal: string; limitsText?: string; limits?: AgentLimitSpec };
  onClose: () => void;
  onSave: (draft: AgentDraft) => void;
}) {
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [limitsText, setLimitsText] = useState(initial?.limitsText ?? "");
  const { add } = useHomeToast(null);
  const ids = { name: useId(), goal: useId(), limits: useId(), read: useId() };
  const parsed = parseLimits(limitsText, initial?.limits ?? DEFAULT_LIMITS);
  const ready = name.trim() && goal.trim();

  function save() {
    onSave({ name: name.trim(), goal: goal.trim(), limits: parsed.spec });
    onClose();
    add({ message: editing ? `Updated ${name.trim()}'s limits.` : `${name.trim()} is ready. It can't trade until you add money to its portfolio.`, tone: "neutral", role: "status" });
  }

  return (
    <MoneyModal open={open} labelledBy="agent-setup-title" onCancel={onClose} onClose={() => undefined}>
      <MoneyModalHeader title={editing ? "Edit limits" : "Add an agent"} titleId="agent-setup-title" />
      <MoneyModalBody hasFooter className="gap-5 pt-2">
        {editing ? null : <>
          <Field>
            <FieldLabel htmlFor={ids.name}>Name</FieldLabel>
            <Input id={ids.name} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rebalance agent" autoComplete="off" />
          </Field>
          <Field>
            <FieldLabel htmlFor={ids.goal}>What should it do?</FieldLabel>
            <Textarea id={ids.goal} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Keep me at 70% Bitcoin, 20% Ether, 10% Cash." rows={2} />
          </Field>
        </>}
        <Field>
          <FieldLabel htmlFor={ids.limits}>Limits, in your words</FieldLabel>
          <Textarea id={ids.limits} value={limitsText} onChange={(e) => setLimitsText(e.target.value)} placeholder="Up to $50 a day, Bitcoin and Ether only, ask me over $25" rows={2} aria-describedby={ids.read} />
          <FieldDescription id={ids.read}>Home reads this into the limits below. It starts by asking you before every trade.</FieldDescription>
        </Field>

        {parsed.understood.length || parsed.refused.length || parsed.missed.length ? (
          <div className="space-y-2" aria-live="polite">
            {parsed.understood.length ? <ul className="flex flex-wrap gap-1.5" aria-label="Understood">{parsed.understood.map((u) => <li key={u}><Badge variant="secondary">{u}</Badge></li>)}</ul> : null}
            {parsed.refused.map((r) => <p key={r.asked} role="status" className="text-sm"><span className="font-medium">Can&apos;t do “{r.asked}”.</span> {r.reason}</p>)}
            {parsed.missed.length ? <p className="text-sm text-muted-foreground">Didn&apos;t understand: {parsed.missed.map((m) => `“${m}”`).join(", ")}</p> : null}
          </div>
        ) : null}

        <section aria-labelledby="agent-setup-limits" className="space-y-1">
          <h3 id="agent-setup-limits" className="text-sm font-medium">What it can do</h3>
          <ManagementFacts rows={describeLimits(parsed.spec)} />
          <p className="text-sm text-muted-foreground">It trades only inside its own portfolio. It can never send money out of Home or change these limits.</p>
        </section>
      </MoneyModalBody>
      <MoneyModalFooter primaryLabel={editing ? "Save limits" : "Add agent"} primaryDisabled={!ready} onPrimary={save} secondaryLabel="Cancel" onSecondary={onClose} />
    </MoneyModal>
  );
}
