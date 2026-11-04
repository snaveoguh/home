"use client";

import { useState } from "react";
import { Bot, Pause, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { ActivityRow, BalanceRow } from "@/components/finance-rows";
import { useHomeToast } from "@/client/home/use-home-toast";
import { formatPresentationDate } from "@/shared/formatting";
import { usd } from "./agent-limits";
import { fixtureActivity, fixtureAgents, type HomeAgent } from "./agent-fixtures";
import { AgentReviewSheet } from "./agent-review-sheet";
import { AgentDetailSheet } from "./agent-detail-sheet";
import { AgentSetupSheet } from "./agent-setup-sheet";

type Open = { sheet: "review" | "detail" | "edit"; id: string } | { sheet: "add" } | null;

export function AgentsHome({ agents: initialAgents = fixtureAgents, initialOpen = null, timeZone }: { agents?: HomeAgent[]; initialOpen?: Open; timeZone?: string }) {
  const [agents, setAgents] = useState(initialAgents);
  const [open, setOpen] = useState<Open>(initialOpen);
  const { add } = useHomeToast(null);
  const total = agents.reduce((sum, a) => sum + Number(a.portfolio), 0);
  const trading = agents.filter((a) => !a.readOnly);
  const allPaused = trading.every((a) => a.paused);
  const current = open && "id" in open ? agents.find((a) => a.id === open.id) ?? null : null;

  function update(next: HomeAgent) {
    setAgents((list) => list.map((a) => (a.id === next.id ? next : a)));
  }

  function pauseAll() {
    setAgents((list) => list.map((a) => (a.readOnly ? a : { ...a, paused: !allPaused })));
    add({ message: allPaused ? "Agents resumed." : `All agents paused. ${trading.length} permissions revoked on Base.`, tone: "neutral", role: "status" });
  }

  return (
    <div className="mx-auto w-full max-w-[40rem] space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-sm text-muted-foreground">Agents</h1>
        <p className="text-4xl font-semibold tabular-nums">{usd(total)}</p>
        <p className="text-sm text-muted-foreground">In {trading.length} agent portfolios. Only you can move money in or out.</p>
      </header>

      <div className="flex gap-2">
        <Button size="touch" onClick={() => setOpen({ sheet: "add" })}><Plus data-icon="inline-start" aria-hidden="true" />Add an agent</Button>
        <Button size="touch" variant="outline" onClick={pauseAll}><Pause data-icon="inline-start" aria-hidden="true" />{allPaused ? "Resume all" : "Pause all"}</Button>
      </div>

      <Card variant="page">
        <CardHeader><SectionHeader headingId="agents-list" title="Your agents" /></CardHeader>
        <CardContent inset="list"><ul aria-labelledby="agents-list">
          {agents.map((agent) => {
            const pending = !agent.paused && agent.pending ? agent.pending.proposals.filter((p) => !p.blocked).length : 0;
            const context = agent.paused ? "Paused" : agent.readOnly ? "Reads only. Can't trade." : agent.goal;
            const activate = () => setOpen({ sheet: pending ? "review" : "detail", id: agent.id });
            return pending
              ? <BalanceRow key={agent.id} icon={<Bot className="size-4" />} iconTone="mark" label={agent.name} context={context} value={usd(Number(agent.portfolio))} attention={`${pending} trades to review`} onActivate={activate} activateLabel={`Review ${agent.name}'s trades`} />
              : <BalanceRow key={agent.id} icon={<Bot className="size-4" />} iconTone="mark" label={agent.name} context={context} value={agent.readOnly ? undefined : usd(Number(agent.portfolio))} onActivate={activate} activateLabel={`Open ${agent.name}`} chevron />;
          })}
        </ul></CardContent>
      </Card>

      <Card variant="page">
        <CardHeader><SectionHeader headingId="agents-activity" title="What they did" /></CardHeader>
        <CardContent inset="list"><ul aria-labelledby="agents-activity">
          {fixtureActivity.map((a) => (
            <ActivityRow key={a.id} icon={<Bot className="size-4" />} iconTone="neutral" label={a.label} contextLines="wrap"
              context={<>{a.agent} · <time dateTime={a.when}>{formatPresentationDate(a.when, { style: "activity-date", timeZone })}</time><br />Why: {a.because}</>}
              value={a.value} onActivate={() => undefined} activateLabel={`View ${a.label} by ${a.agent}`} />
          ))}
        </ul></CardContent>
      </Card>

      {current?.pending ? <AgentReviewSheet open={open?.sheet === "review"} request={current.pending} onApproved={() => update({ ...current, pending: undefined })} onClose={() => setOpen(null)} /> : null}
      {current ? <AgentDetailSheet open={open?.sheet === "detail"} agent={current} onChange={update} onClose={() => setOpen(null)} onEditLimits={() => setOpen({ sheet: "edit", id: current.id })} /> : null}
      {current && open?.sheet === "edit" ? <AgentSetupSheet open initial={{ name: current.name, goal: current.goal, limits: current.limits }} onClose={() => setOpen({ sheet: "detail", id: current.id })} onSave={(d) => update({ ...current, limits: d.limits })} /> : null}
      {open?.sheet === "add" ? <AgentSetupSheet open onClose={() => setOpen(null)} onSave={(d) => setAgents((list) => [...list, { id: `agent-${list.length}`, name: d.name, goal: d.goal, limits: d.limits, portfolio: "0" }])} /> : null}
    </div>
  );
}
