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
