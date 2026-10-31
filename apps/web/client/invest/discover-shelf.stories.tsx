import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DiscoverShelf } from "./discover-shelf";

const meta = {
  id: "invest-discover-shelf",
  title: "Invest/Discover shelf",
  component: DiscoverShelf,
  parameters: { layout: "padded", a11y: { test: "error" } },
  args: {
    title: "Memes",
    assets: [],
    market: { status: "loading" },
    onSeeAll: () => undefined,
    onOpenAsset: () => undefined,
  },
  decorators: [(Story) => <div className="max-w-[390px]"><Story /></div>],
} satisfies Meta<typeof DiscoverShelf>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { status: "loading" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Loading memes");
  },
};

export const CantLoad: Story = {
  args: { status: "unavailable", market: { status: "unavailable" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Can’t load memes right now")).toBeVisible();
  },
};

export const NothingTrending: Story = {
  args: { status: "empty", market: { status: "ready", snapshots: [] } },
};
