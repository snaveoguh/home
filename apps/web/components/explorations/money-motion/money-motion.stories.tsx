import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";
import { ActivityRow } from "@/components/finance-rows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusStep, StatusSteps } from "@/components/ui/status-step";
import { AccruingAmount } from "./accruing-amount";
import { arrivalProps } from "./arrival";
import { BalanceUpdate } from "./balance-update";
import { ConfirmHeader } from "./confirm-mark";
import { MoneyMotionScope } from "./motion-scope";
import { moneyMotion, type MoneyMotionMode } from "./tokens";

type Args = { motion: MoneyMotionMode };

function Frame({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type Entry = { id: number; label: string; context: string; value: string; incoming: boolean };

const seedActivity: Entry[] = [
  { id: 2, label: "Sent", context: "To Sample Payee B · Oct 30", value: "-$40.00", incoming: false },
  { id: 1, label: "Received", context: "From Sample Payee A · Oct 29", value: "+$120.00", incoming: true },
];

function MoneyArrivingDemo() {
  const [entries, setEntries] = useState(seedActivity);
  const [arrivedId, setArrivedId] = useState<number | null>(null);
  const receive = () => {
    const id = entries.length + 1;
    setEntries([{ id, label: "Received", context: "From Sample Payee A · Just now", value: "+$25.00", incoming: true }, ...entries]);
    setArrivedId(id);
  };
  return (
    <Frame title="Money arriving" note="Simulated. The new row opens in, settles, and a muted wash fades.">
      <ul className="list-none p-0" aria-label="Activity">
        {entries.map((entry) => (
          <ActivityRow
            key={entry.id}
            liProps={arrivalProps(entry.id === arrivedId)}
            icon={entry.incoming ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />}
            iconTone={entry.incoming ? "incoming" : "outgoing"}
            label={entry.label}
            context={entry.context}
            value={entry.value}
            valueTone={entry.incoming ? "success" : "default"}
            onActivate={() => {}}
            activateLabel={`View ${entry.label} details`}
          />
        ))}
      </ul>
      <Button className="mt-4" variant="outline" size="sm" onClick={receive}>Simulate incoming $25.00</Button>
    </Frame>
  );
}

function SendConfirmingDemo() {
  const [run, setRun] = useState(0);
  const [state, setState] = useState<"pending" | "confirmed">("pending");
  useEffect(() => {
    if (run === 0) return;
    const timer = setTimeout(() => setState("confirmed"), 900);
    return () => clearTimeout(timer);
  }, [run]);
  const replay = () => {
    setState("pending");
    setRun(run + 1);
  };
  return (
    <Frame title="Send confirming" note="Simulated. The spinner hands off to a drawn check once Base confirms.">
      <div className="flex flex-col items-center gap-8 py-4">
        <ConfirmHeader
          state={state}
          pendingTitle="$25.00 on its way"
          pendingDescription="We'll update Activity when it's confirmed."
          confirmedTitle="$25.00 sent"
        />
        <div className="w-full">
          <StatusSteps>
            <StatusStep status="complete" title="Submitted" />
            <StatusStep status={state === "confirmed" ? "complete" : "current"} title="Confirming on Base" />
          </StatusSteps>
        </div>
        <Button variant="outline" size="sm" onClick={replay}>{run === 0 ? "Send $25.00" : "Replay"}</Button>
      </div>
    </Frame>
  );
}

function SavingsEarningDemo() {
  const [startedAt] = useState(() => Date.now());
  return (
    <Frame title="Savings earning" note="Simulated 4.10% APY on $4,812.30. One quiet tick a second, paused when the tab is hidden.">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Earned this month</p>
        <p className="text-2xl font-semibold">
          <AccruingAmount principal={4812.3} apy={0.041} earnedBefore={12.408261} startedAt={startedAt} />
        </p>
        <p className="text-sm text-muted-foreground">Save balance $4,812.30</p>
      </div>
    </Frame>
  );
}

function BalanceUpdatingDemo() {
  const [value, setValue] = useState(4812.3);
  return (
    <Frame title="Balance updating" note="Simulated. Only changed digits roll; the difference shows once, then fades.">
      <BalanceUpdate value={value} />
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setValue(Math.round((value + 25) * 100) / 100)}>Add $25.00</Button>
        <Button variant="outline" size="sm" onClick={() => setValue(Math.round((value - 12.4) * 100) / 100)}>Spend $12.40</Button>
      </div>
    </Frame>
  );
}

const tokenRows = [
  ["fade", moneyMotion.duration.fade, "enter", "Opacity only. The whole reduced-motion path."],
  ["arrive", moneyMotion.duration.arrive, "enter", "New activity row, delta line, confirmed title."],
  ["tick", moneyMotion.duration.tick, "standard", "Interest digits, once a second."],
  ["confirm", moneyMotion.duration.confirm, "settle", "Ring, then check, drawn in sequence."],
  ["roll", moneyMotion.duration.roll, "settle", "Balance digits that changed."],
  ["hold", moneyMotion.duration.hold, "none", "How long a delta or wash stays readable."],
] as const;

function TokenSheet() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Money motion tokens</CardTitle>
        <CardDescription>Every moment finishes moving inside 400ms. Easings alias the existing Home curves.</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-start text-sm">
          <thead className="text-muted-foreground">
            <tr><th className="py-1 text-start font-medium">Token</th><th className="py-1 text-start font-medium">ms</th><th className="py-1 text-start font-medium">Ease</th><th className="py-1 text-start font-medium">Use</th></tr>
          </thead>
          <tbody>
            {tokenRows.map(([name, ms, ease, use]) => (
              <tr key={name} className="border-t">
                <td className="py-2 font-mono">{name}</td>
                <td className="py-2 tabular-nums">{ms}</td>
                <td className="py-2">{ease}</td>
                <td className="py-2 text-muted-foreground">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

const meta = {
  id: "explorations-money-motion",
  tags: ["exploration"],
  title: "Explorations/Money motion",
  args: { motion: "system" },
  argTypes: { motion: { control: "inline-radio", options: ["system", "reduce"] } },
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [
    (Story, { args }) => (
      <MoneyMotionScope mode={(args as Args).motion}>
        <div className="flex min-h-screen flex-wrap items-start justify-center gap-6 bg-background p-4 text-foreground sm:p-8">
          <Story />
        </div>
      </MoneyMotionScope>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MoneyArriving: Story = {
  render: () => <MoneyArrivingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Simulate incoming $25.00" }));
    await expect(canvasElement.querySelector('[data-arriving="true"]')).not.toBeNull();
  },
};

export const SendConfirming: Story = {
  render: () => <SendConfirmingDemo />,
};

export const SavingsEarning: Story = {
  render: () => <SavingsEarningDemo />,
};

export const BalanceUpdating: Story = {
  render: () => <BalanceUpdatingDemo />,
};

export const ReducedMotion: Story = {
  args: { motion: "reduce" },
  render: () => <><MoneyArrivingDemo /><SendConfirmingDemo /><SavingsEarningDemo /><BalanceUpdatingDemo /></>,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-money-motion="reduce"]')).not.toBeNull();
  },
};

export const AllMoments: Story = {
  render: () => <><MoneyArrivingDemo /><SendConfirmingDemo /><SavingsEarningDemo /><BalanceUpdatingDemo /></>,
};

export const Tokens: Story = {
  render: () => <TokenSheet />,
};
