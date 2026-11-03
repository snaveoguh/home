import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toast";
import { AgentReviewSheet } from "@/client/explorations/agent/agent-review-sheet";
import { overLimitRequest, rebalanceRequest, sellOnlyRequest, type AgentRequest } from "@/client/explorations/agent/agent-fixtures";

function AgentReviewStory({ request = rebalanceRequest, initiallyOpen = true }: { request?: AgentRequest; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <Toaster>
    <main className="p-4"><Button onClick={() => setOpen(true)}>Review trades</Button></main>
    <AgentReviewSheet open={open} request={request} onClose={() => setOpen(false)} />
  </Toaster>;
}

const meta = {
  id: "explorations-agent-review",
  tags: ["exploration"],
  title: "Explorations/Agent Review",
  component: AgentReviewStory,
  decorators: [(Story) => <><aside className="relative z-50 px-4 pt-2"><Badge variant="outline">Development fixtures</Badge></aside><Story /></>],
  parameters: { layout: "fullscreen", a11y: { test: "todo" } },
  globals: { viewport: { value: "mobile" } },
} satisfies Meta<typeof AgentReviewStory>;
export default meta;
type Story = StoryObj<typeof meta>;

const sheet = async (canvasElement: HTMLElement) => within(await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Review trades" }));

export const Proposal: Story = { play: async ({ canvasElement }) => {
  const dialog = await sheet(canvasElement);
  await expect(dialog.getByText("You asked: “Keep me at 70% Bitcoin, 20% Ether, 10% Cash.”")).toBeVisible();
  await expect(dialog.getByRole("switch", { name: "Include Buy Bitcoin" })).toBeChecked();
  await expect(dialog.getByText("Solana isn't on this agent's list.")).toBeVisible();
  await expect(dialog.queryByRole("switch", { name: "Include Buy Solana" })).not.toBeInTheDocument();
  await expect(dialog.getByRole("button", { name: "Approve 2 trades" })).toBeEnabled();
} };

export const TurnOneOff: Story = { play: async ({ canvasElement }) => {
  const dialog = await sheet(canvasElement);
  await userEvent.click(dialog.getByRole("switch", { name: "Include Sell Ether" }));
  await expect(dialog.getByRole("button", { name: "Approve 1 trade" })).toBeEnabled();
  await expect(dialog.getByText("From Cash")).toBeVisible();
} };

export const OverDailyLimit: Story = { args: { request: overLimitRequest }, play: async ({ canvasElement }) => {
  const dialog = await sheet(canvasElement);
  await expect(dialog.getByText("Over today's limit. $100.00 left.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Approve 1 trade" })).toBeEnabled();
  await expect(dialog.getByText("To Cash")).toBeVisible();
} };

export const NothingToApprove: Story = { args: { request: sellOnlyRequest }, play: async ({ canvasElement }) => {
  const dialog = await sheet(canvasElement);
  await userEvent.click(dialog.getByRole("switch", { name: "Include Sell Ether" }));
  await expect(dialog.getByRole("button", { name: "Approve" })).toBeDisabled();
} };

export const Approved: Story = { play: async ({ canvasElement }) => {
  const dialog = await sheet(canvasElement);
  await userEvent.click(dialog.getByRole("button", { name: "Approve 2 trades" }));
  await expect(await within(canvasElement.ownerDocument.body).findByText("Approved 2 trades. Rebalance agent is placing them.")).toBeVisible();
} };

export const ProposalDesktop: Story = { ...Proposal, globals: { viewport: { value: "desktop" } } };
