import { formatFiatAmount } from "@/shared/formatting";

export const AGENT_ASSETS = ["Bitcoin", "Ether", "Cash", "Solana"] as const;
export type AgentAsset = (typeof AGENT_ASSETS)[number];

export const HOME_DAILY_CAP = 1000;

export type AgentLimitSpec = {
  spend: { amount: number; period: "day" | "week" | "month" } | null;
  perTrade: number | null;
  askOver: number | null;
  assets: AgentAsset[] | null;
  blockedAssets: AgentAsset[];
};

export type ParsedLimits = {
  spec: AgentLimitSpec;
  understood: string[];
  refused: { asked: string; reason: string }[];
  missed: string[];
};

export const DEFAULT_LIMITS: AgentLimitSpec = { spend: null, perTrade: null, askOver: 0, assets: null, blockedAssets: [] };

const aliases: Record<string, AgentAsset> = {
  bitcoin: "Bitcoin", btc: "Bitcoin", cbbtc: "Bitcoin",
  ether: "Ether", eth: "Ether", ethereum: "Ether",
  cash: "Cash", usdc: "Cash", dollars: "Cash",
  solana: "Solana", sol: "Solana",
};
const assetPattern = new RegExp(`\\b(${Object.keys(aliases).join("|")})\\b`, "g");
const money = String.raw`\$?\s*(\d[\d,]*(?:\.\d+)?)`;

function amount(value: string) {
  return Number(value.replaceAll(",", ""));
}

function assetsIn(text: string) {
  return [...new Set([...text.matchAll(assetPattern)].map((m) => aliases[m[1]]))];
}

export const usd = (value: number) => formatFiatAmount(String(value), "USD", { currencyNative: true });

export function parseLimits(input: string, base: AgentLimitSpec = DEFAULT_LIMITS): ParsedLimits {
  const spec: AgentLimitSpec = { ...base, blockedAssets: [...base.blockedAssets] };
  const understood: string[] = [];
  const refused: ParsedLimits["refused"] = [];
  const missed: string[] = [];

  for (const raw of input.split(/,(?!\d{3}\b)|;|\.(?!\d)|\n/)) {
    const clause = raw.trim().toLowerCase();
    if (!clause) continue;
    let hit = false;

    if (/\b(send|withdraw|transfer|cash out|move money out)\b/.test(clause) && !/\b(no|never|don'?t|can'?t)\b/.test(clause)) {
      refused.push({ asked: raw.trim(), reason: "Agents can't send money out of Home. They trade inside their own portfolio." });
      continue;
    }
    if (/\b(change|raise|edit) (its|their|the|my) (own )?limits?\b/.test(clause) && !/\b(no|never|don'?t|can'?t)\b/.test(clause)) {
      refused.push({ asked: raw.trim(), reason: "Only you can change an agent's limits." });
      continue;
    }

    const spend = new RegExp(`${money}\\s*(?:a|per|each|every|/)\\s*(day|week|month)`).exec(clause);
    if (spend && !/\b(trade|order)\b/.test(clause.slice(spend.index))) {
      const value = amount(spend[1]);
      const period = spend[2] as "day" | "week" | "month";
      const daily = period === "day" ? value : period === "week" ? value / 7 : value / 30;
      if (daily > HOME_DAILY_CAP) {
        refused.push({ asked: raw.trim(), reason: `Agents can spend up to ${usd(HOME_DAILY_CAP)} a day in Home.` });
        continue;
      }
      spec.spend = { amount: value, period };
      understood.push(`Spend up to ${usd(value)} a ${period}`);
      hit = true;
    }

    const perTrade = new RegExp(`${money}\\s*(?:a|per|each)\\s*(?:trade|order)`).exec(clause);
    if (perTrade) {
      spec.perTrade = amount(perTrade[1]);
      understood.push(`Up to ${usd(spec.perTrade)} a trade`);
      hit = true;
    }

    if (/\b(always ask|ask (me )?(first|every time|before every|before each)|every trade)\b/.test(clause)) {
      spec.askOver = 0;
      understood.push("Asks you before every trade");
      hit = true;
    } else if (/\b(never ask|don'?t ask|no need to ask|without asking)\b/.test(clause)) {
      spec.askOver = null;
      understood.push("Trades within limits without asking");
      hit = true;
    } else {
      const ask = new RegExp(`ask[^$\\d]*(?:over|above|more than|for anything over)\\s*${money}`).exec(clause);
      if (ask) {
        spec.askOver = amount(ask[1]);
        understood.push(`Asks you over ${usd(spec.askOver)}`);
        hit = true;
      }
    }

    const named = assetsIn(clause);
    if (named.length && /\b(no|not|never|avoid|except|without)\b/.test(clause)) {
      spec.blockedAssets = [...new Set([...spec.blockedAssets, ...named])];
      spec.assets = spec.assets?.filter((a) => !named.includes(a)) ?? null;
      understood.push(`Never trades ${named.join(" or ")}`);
      hit = true;
    } else if (named.length && /\b(only|just)\b/.test(clause)) {
      spec.assets = named;
      spec.blockedAssets = spec.blockedAssets.filter((a) => !named.includes(a));
      understood.push(`Only ${named.join(" and ")}`);
      hit = true;
    }

    if (!hit) missed.push(raw.trim());
  }

  return { spec, understood, refused, missed };
}

export function describeLimits(spec: AgentLimitSpec): [string, string][] {
  return [
    ["Spend", spec.spend ? `Up to ${usd(spec.spend.amount)} a ${spec.spend.period}` : `Up to ${usd(HOME_DAILY_CAP)} a day`],
    ["Per trade", spec.perTrade === null ? "No extra limit" : `Up to ${usd(spec.perTrade)}`],
    ["Can trade", spec.assets ? spec.assets.join(", ") : AGENT_ASSETS.filter((a) => !spec.blockedAssets.includes(a)).join(", ")],
    ["Asks you", spec.askOver === null ? "Never, within these limits" : spec.askOver === 0 ? "Before every trade" : `Over ${usd(spec.askOver)}`],
  ];
}
