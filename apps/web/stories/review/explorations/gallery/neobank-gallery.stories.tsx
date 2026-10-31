import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AccountWalletClientProvider, createBlockedAccountWalletClient } from "@/client/account/cdp-client";
import { ActivityPanelView } from "@/client/activity";
import { BrandNameProvider } from "@/client/brand/brand-name";
import { FundingActions } from "@/client/funding/funding-actions";
import { HomeOverview } from "@/client/home/home-overview";
import { LandingShell } from "@/client/home/landing-shell";
import { SupportedGlobeDynamic } from "@/client/landing/supported-globe-dynamic";
import { TransferActions } from "@/client/transfers";
import { brandCopyName } from "@/shared/operator-branding/theme";
import { activity, pendingSend, transfers } from "../../../journeys/explorations/activity-transfer-runs.fixtures";
import { CompositionShell, compositionShellHandlers } from "../../../journeys/explorations/composition-shell";
import { balance, wallet } from "../../../journeys/explorations/home-pull-to-refresh.fixtures";
import { availableAssets } from "../../../journeys/explorations/send-recipient.fixtures";
import { exampleBanks, proposedCss, proposedSettingsShape, todayCss, type ExampleBank } from "./banks";
import { BankImagery } from "./imagery";

type Level = "today" | "proposed";
type Surface = "landing" | "home";
type GalleryArgs = { bank: string; level: Level; surface: Surface };

const signedOut = createBlockedAccountWalletClient("unconfigured");

function bankById(id: string): ExampleBank {
  const bank = exampleBanks.find((candidate) => candidate.id === id);
  if (!bank) throw new Error(`Unknown example bank ${id}`);
  return bank;
}

function Theme({ bank, level }: { bank: ExampleBank; level: Level }) {
  return <style>{level === "today" ? todayCss(bank) : proposedCss(bank)}</style>;
}

function Landing({ bank, level }: { bank: ExampleBank; level: Level }) {
  const visual = level === "today" ? <SupportedGlobeDynamic /> : <BankImagery imagery={bank.proposed.imagery} />;
  return <AccountWalletClientProvider client={signedOut}>
    <LandingShell landingVisual={visual} initialSearch="" />
  </AccountWalletClientProvider>;
}

function SignedInHome() {
  return <CompositionShell>
    <HomeOverview accountKey={wallet.ownerKey} assetBalances={balance} cashRate="4.20% APY" borrowOfferRate="5.10% APR"
      onRetryBalances={() => {}}
      destinations={{ onOpenCash: () => {}, onOpenInvestments: () => {}, onOpenBorrow: () => {} }}
      actions={<><FundingActions regionId="US" /><TransferActions availableAssets={availableAssets} regionId="US" /></>}
      activity={<ActivityPanelView activity={activity(transfers)} operations={[pendingSend]} density="feed" regionId="US" />} />
  </CompositionShell>;
}

function GalleryBank({ bank: id, level, surface }: GalleryArgs) {
  const bank = bankById(id);
  return <BrandNameProvider name={brandCopyName(bank.today.displayName)}>
    <Theme bank={bank} level={level} />
    {surface === "landing" ? <Landing bank={bank} level={level} /> : <SignedInHome />}
  </BrandNameProvider>;
}

const meta = {
  id: "explorations-neobank-gallery",
  title: "Review/Explorations/Neobank gallery",
  tags: ["exploration"],
  component: GalleryBank,
  args: { bank: "lagoon-line", level: "proposed", surface: "landing" },
  argTypes: {
    bank: { control: "select", options: exampleBanks.map((bank) => bank.id) },
    level: { control: "inline-radio", options: ["today", "proposed"] },
    surface: { control: "inline-radio", options: ["landing", "home"] },
  },
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/home" } },
    msw: { handlers: compositionShellHandlers },
  },
} satisfies Meta<typeof GalleryBank>;

export default meta;
type Story = StoryObj<typeof meta>;

const landingPlay: Story["play"] = async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole("heading", { level: 1 })).toBeVisible();
};
const homePlay: Story["play"] = async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByLabelText("Total balance")).toBeVisible();
};

export const LagoonLineLanding: Story = { args: { bank: "lagoon-line", surface: "landing" }, play: landingPlay };
export const LagoonLineHome: Story = { args: { bank: "lagoon-line", surface: "home" }, play: homePlay };
export const PocketfulLanding: Story = { args: { bank: "pocketful", surface: "landing" }, play: landingPlay };
export const PocketfulHome: Story = { args: { bank: "pocketful", surface: "home" }, play: homePlay };
export const TallyhouseLanding: Story = { args: { bank: "tallyhouse", surface: "landing" }, play: landingPlay };
export const TallyhouseHome: Story = { args: { bank: "tallyhouse", surface: "home" }, play: homePlay };
export const AshcombeLanding: Story = { args: { bank: "ashcombe", surface: "landing" }, play: landingPlay };
export const AshcombeHome: Story = { args: { bank: "ashcombe", surface: "home" }, play: homePlay };
export const MoshpitLanding: Story = { args: { bank: "moshpit", surface: "landing" }, play: landingPlay };
export const MoshpitHome: Story = { args: { bank: "moshpit", surface: "home" }, play: homePlay };

function Swatch({ colour, label }: { colour: string; label: string }) {
  return <span className="inline-flex items-center gap-2 font-mono text-xs">
    <span className="size-4 rounded-sm border" style={{ backgroundColor: colour }} aria-hidden="true" />{label} {colour}
  </span>;
}

function Index() {
  return <main className="mx-auto flex max-w-5xl flex-col gap-8 bg-background p-6 text-foreground md:p-12">
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">Example neobanks</h1>
      <p className="max-w-prose text-muted-foreground">Five made-up banks on one Home deployment. Each one is shown with the two colours operators can set today, and with six proposed additions. All names are fictional and all balances are fixture data.</p>
    </header>
    <ul className="grid gap-4 md:grid-cols-2">
      {exampleBanks.map((bank) => {
        const shape = proposedSettingsShape(bank);
        return <li key={bank.id} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">{bank.name}</h2>
          <p className="text-sm text-muted-foreground">{bank.customer}</p>
          <div className="flex flex-col gap-1">
            <Swatch colour={bank.today.primaryColor} label="primary" />
            <Swatch colour={bank.today.backgroundColor} label="background" />
          </div>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{JSON.stringify({ darkPrimaryColor: shape.darkPrimaryColor, darkBackgroundColor: shape.darkBackgroundColor, typeface: shape.typeface, radius: shape.radius, density: shape.density, logo: shape.logo, landingImage: shape.landingImage }, null, 2)}</pre>
        </li>;
      })}
    </ul>
  </main>;
}

export const Overview: StoryObj = {
  render: () => <Index />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("listitem")).toHaveLength(exampleBanks.length);
  },
};
