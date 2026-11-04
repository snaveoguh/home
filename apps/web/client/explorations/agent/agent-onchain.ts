import { BASE_CHAIN_ID, BASE_USDC, type BaseAddress } from "@/shared/assets/base";
import { HOME_DAILY_CAP, describeLimits, usd, type AgentLimitSpec } from "./agent-limits";

const periodInDays = { day: 1, week: 7, month: 30 } as const;

export type SpendPermissionRequest = {
  account: BaseAddress;
  spender: BaseAddress;
  token: BaseAddress;
  chainId: number;
  allowance: bigint;
  periodInDays: number;
  start: Date;
};

export type AgentPermissionPlan = {
  request: SpendPermissionRequest | null;
  base: [string, string][];
  home: [string, string][];
};

export function planSpendPermission(spec: AgentLimitSpec, { account, spender, start, readOnly = false }: { account: BaseAddress; spender: BaseAddress; start: Date; readOnly?: boolean }): AgentPermissionPlan {
  const home = describeLimits(spec).filter(([label]) => label !== "Spend");
  if (readOnly || spec.assets?.length === 0) return { request: null, base: [["Spend from Cash", "Nothing. It has no permission."]], home: [] };
  const spend = spec.spend ?? { amount: HOME_DAILY_CAP, period: "day" as const };
  const days = periodInDays[spend.period];
  return {
    request: {
      account,
      spender,
      token: BASE_USDC.address as BaseAddress,
      chainId: BASE_CHAIN_ID,
      allowance: BigInt(Math.round(spend.amount * 10 ** BASE_USDC.decimals)),
      periodInDays: days,
      start,
    },
    base: [
      ["Spend from Cash", `Up to ${usd(spend.amount)} every ${days === 1 ? "day" : `${days} days`}`],
      ["Spent by", "Home's agent executor, never the agent"],
      ["Stop it", "Revoke any time, here or in your wallet"],
    ],
    home,
  };
}
