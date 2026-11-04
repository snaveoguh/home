import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toast";
import { AgentsHome } from "@/client/explorations/agent/agents-home";

type Args = { initialOpen?: Parameters<typeof AgentsHome>[0]["initialOpen"] };

function AgentsStory({ initialOpen = null }: Args) {
  return <Toaster><AgentsHome initialOpen={initialOpen} timeZone="UTC" /></Toaster>;
}

const meta = {
  id: "explorations-agents",
  tags: ["exploration"],
  title: "Explorations/Agents",
  component: AgentsStory,
  decorators: [(Story) => <><aside className="relative z-50 px-4 pt-2"><Badge variant="outline">Development fixtures</Badge></aside><Story /></>],
  parameters: { layout: "fullscreen", a11y: { test: "todo" } },
  globals: { viewport: { value: "mobile" } },
} satisfies Meta<typeof AgentsStory>;
export default meta;
type Story = StoryObj<typeof meta>;

const body = (el: HTMLElement) => within(el.ownerDocument.body);

export const Overview: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("$1,840.00")).toBeVisible();
  await expect(canvas.getByText("2 trades to review")).toBeVisible();
  await expect(canvas.getByText("Reads only. Can't trade.")).toBeVisible();
  await expect(canvas.getAllByText(/Why: Buy \$50 of Bitcoin every Wednesday\./)).toHaveLength(2);
} };

export const PauseAll: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Pause all" }));
  await expect(canvas.getAllByText("Paused")).toHaveLength(2);
  await expect(canvas.queryByText("2 trades to review")).not.toBeInTheDocument();
  await expect(await body(canvasElement).findByText("All agents paused. 2 permissions revoked on Base.")).toBeVisible();
  await expect(canvas.getByRole("button", { name: "Resume all" })).toBeVisible();
} };

export const ReviewFromRow: Story = { play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: /^Rebalance agent/ }));
  const dialog = within(await body(canvasElement).findByRole("dialog", { name: "Review trades" }));
  await userEvent.click(dialog.getByRole("button", { name: "Approve 2 trades" }));
  await expect(within(canvasElement).queryByText("2 trades to review")).not.toBeInTheDocument();
} };

export const AddAgent: Story = { play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Add an agent" }));
  const dialog = within(await body(canvasElement).findByRole("dialog", { name: "Add an agent" }));
  await expect(dialog.getByRole("button", { name: "Add and sign" })).toBeDisabled();
  await userEvent.type(dialog.getByRole("textbox", { name: "Name" }), "Dip buyer");
  await userEvent.type(dialog.getByRole("textbox", { name: "What should it do?" }), "Buy Bitcoin when it drops 10% in a day.");
  await userEvent.type(dialog.getByRole("textbox", { name: "Limits, in your words" }), "Up to $100 a week, Bitcoin only, ask me over $40, nothing silly");
  await expect(dialog.getByText("Spend up to $100.00 a week")).toBeVisible();
  await expect(dialog.getByText("Only Bitcoin")).toBeVisible();
  await expect(dialog.getByText("Didn't understand: “nothing silly”")).toBeVisible();
  await expect(dialog.getByText("Up to $100.00 every 7 days")).toBeVisible();
  await expect(dialog.getByText("Home's agent executor, never the agent")).toBeVisible();
  await userEvent.click(dialog.getByRole("button", { name: "Add and sign" }));
  await expect(await within(canvasElement).findByText("Dip buyer")).toBeVisible();
} };

export const AddAgentRefusals: Story = { play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "Add an agent" }));
  const dialog = within(await body(canvasElement).findByRole("dialog", { name: "Add an agent" }));
  await userEvent.type(dialog.getByRole("textbox", { name: "Limits, in your words" }), "send profits to my bank, $5,000 a day");
  await expect(dialog.getByText(/Agents can't send money out of Home\./)).toBeVisible();
  await expect(dialog.getByText(/Agents can spend up to \$1,000\.00 a day in Home\./)).toBeVisible();
} };

export const AgentSettings: Story = { args: { initialOpen: { sheet: "detail", id: "dca" } }, play: async ({ canvasElement }) => {
  const dialog = within(await body(canvasElement).findByRole("dialog", { name: "Weekly Bitcoin" }));
  await expect(dialog.getByText("$600.00")).toBeVisible();
  await expect(dialog.getByRole("radio", { name: "Never, within its limits" })).toBeChecked();
  await userEvent.click(dialog.getByRole("radio", { name: "Before every trade" }));
  await expect(dialog.getByRole("radio", { name: "Before every trade" })).toBeChecked();
  await userEvent.click(dialog.getByRole("button", { name: "Pause agent" }));
  await expect(dialog.getByText("Paused. Its permission is revoked, so it can't spend.")).toBeVisible();
} };

export const EditLimits: Story = { args: { initialOpen: { sheet: "edit", id: "dca" } }, play: async ({ canvasElement }) => {
  const dialog = within(await body(canvasElement).findByRole("dialog", { name: "Edit limits" }));
  await expect(dialog.getByText("Up to $50.00 every 7 days")).toBeVisible();
  await userEvent.type(dialog.getByRole("textbox", { name: "Limits, in your words" }), "$80 a week");
  await expect(dialog.getByText("Up to $80.00 every 7 days")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save and sign" })).toBeEnabled();
} };

export const EditHomeOnlyLimit: Story = { args: { initialOpen: { sheet: "edit", id: "dca" } }, play: async ({ canvasElement }) => {
  const dialog = within(await body(canvasElement).findByRole("dialog", { name: "Edit limits" }));
  await userEvent.type(dialog.getByRole("textbox", { name: "Limits, in your words" }), "$30 per trade");
  await expect(dialog.getByText("Up to $30.00")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save limits" })).toBeEnabled();
} };

export const OverviewDesktop: Story = { ...Overview, globals: { viewport: { value: "desktop" } } };
