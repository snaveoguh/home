import type { AgentLimitSpec } from "./agent-limits";

export type AgentProposal = {
  id: string;
  side: "buy" | "sell";
  asset: string;
  usd: string;
  units?: string;
  reason: string;
  blocked?: string;
};

export type AgentLimits = {
  dailyLimit: string;
  dailyLeft: string;
  assets: string[];
};

export type AgentRequest = {
  agent: string;
  asked: string;
  proposals: AgentProposal[];
  limits: AgentLimits;
};

export const fixtureLimits: AgentLimits = {
  dailyLimit: "150",
  dailyLeft: "150",
  assets: ["Bitcoin", "Ether"],
};

export const rebalanceRequest: AgentRequest = {
  agent: "Rebalance agent",
  asked: "Keep me at 70% Bitcoin, 20% Ether, 10% Cash.",
  limits: fixtureLimits,
  proposals: [
    { id: "buy-btc", side: "buy", asset: "Bitcoin", usd: "120", units: "0.0011 cbBTC", reason: "Bitcoin is 64%. Target is 70%." },
    { id: "sell-eth", side: "sell", asset: "Ether", usd: "45", units: "0.0118 ETH", reason: "Ether is 24%. Target is 20%." },
    { id: "buy-sol", side: "buy", asset: "Solana", usd: "60", reason: "Spread across more assets.", blocked: "Solana isn't on this agent's list." },
  ],
};

export const overLimitRequest: AgentRequest = {
  ...rebalanceRequest,
  limits: { ...fixtureLimits, dailyLeft: "100" },
};

export const sellOnlyRequest: AgentRequest = {
  ...rebalanceRequest,
  proposals: rebalanceRequest.proposals.filter((p) => p.id === "sell-eth"),
};

export type HomeAgent = {
  id: string;
  name: string;
  goal: string;
  portfolio: string;
  limits: AgentLimitSpec;
  paused?: boolean;
  readOnly?: boolean;
  pending?: AgentRequest;
};

export type AgentActivity = { id: string; agent: string; label: string; value: string; when: string; because: string };

export const fixtureAgents: HomeAgent[] = [
  { id: "rebalance", name: "Rebalance agent", goal: rebalanceRequest.asked, portfolio: "1240", pending: rebalanceRequest,
    limits: { spend: { amount: 150, period: "day" }, perTrade: null, askOver: 0, assets: ["Bitcoin", "Ether"], blockedAssets: [] } },
  { id: "dca", name: "Weekly Bitcoin", goal: "Buy $50 of Bitcoin every Wednesday.", portfolio: "600",
    limits: { spend: { amount: 50, period: "week" }, perTrade: 50, askOver: null, assets: ["Bitcoin"], blockedAssets: [] } },
  { id: "research", name: "Monday briefing", goal: "Every Monday, tell me what moved and why.", portfolio: "0", readOnly: true,
    limits: { spend: null, perTrade: null, askOver: 0, assets: [], blockedAssets: [] } },
];

export const fixtureActivity: AgentActivity[] = [
  { id: "a1", agent: "Weekly Bitcoin", label: "Bought Bitcoin", value: "$50.00", when: "2026-10-28T09:00:00.000Z", because: "Buy $50 of Bitcoin every Wednesday." },
  { id: "a2", agent: "Rebalance agent", label: "Sold Ether", value: "$32.00", when: "2026-10-27T14:12:00.000Z", because: "Ether drifted to 23%. You asked for 20%." },
  { id: "a3", agent: "Weekly Bitcoin", label: "Bought Bitcoin", value: "$50.00", when: "2026-10-21T09:00:00.000Z", because: "Buy $50 of Bitcoin every Wednesday." },
];

export const fixtureAccount = "0x1111111111111111111111111111111111111111" as const;
export const fixtureExecutor = "0x2222222222222222222222222222222222222222" as const;
export const fixturePermissionStart = new Date("2026-11-04T00:00:00.000Z");
