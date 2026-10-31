import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { SupportedGlobe } from "@/client/landing/supported-globe";
import { waitForReady } from "@/tests/helpers/story-readiness";

function LandingGlobe(props: { showRoutes: boolean; simulatedActivity: boolean }) {
  return (
    <div className="mx-auto w-full max-w-xl p-4">
      <SupportedGlobe ariaLabel="Interactive globe of the countries Home supports" {...props} />
    </div>
  );
}

const meta = {
  id: "explorations-landing-globe",
  title: "Explorations/Landing/Globe",
  component: LandingGlobe,
  tags: ["exploration"],
  args: { showRoutes: false, simulatedActivity: true },
  parameters: { layout: "fullscreen", a11y: { test: "todo" } },
} satisfies Meta<typeof LandingGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimulatedPings: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Pings are simulated, not live activity.")).toBeVisible();
  },
};

export const IllustrativeRoutes: Story = { args: { showRoutes: true, simulatedActivity: false } };

export const CountryOffer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForReady(() => expect(canvasElement.querySelector("figure")).toHaveAttribute("data-renderer", "ready"));
    const brazil = canvas.getByRole("button", { name: /^Brazil/ });
    await userEvent.click(brazil);
    await waitForReady(() => expect(canvas.getByText("wBRL on Base · Additional verification")).toBeInTheDocument());
  },
};
