import { describe, expect, test } from "bun:test";
import { parseLimits } from "./agent-limits";
import { planSpendPermission } from "./agent-onchain";

const ids = { account: "0x1111111111111111111111111111111111111111", spender: "0x2222222222222222222222222222222222222222", start: new Date("2026-11-04T00:00:00.000Z") } as const;

describe("planSpendPermission", () => {
  test("turns a weekly spend into a USDC allowance every 7 days", () => {
    const { request } = planSpendPermission(parseLimits("Up to $100 a week, Bitcoin only").spec, ids);
    expect(request).toEqual({
      account: "0x1111111111111111111111111111111111111111",
      spender: "0x2222222222222222222222222222222222222222",
      token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      chainId: 8453,
      allowance: BigInt(100_000_000),
      periodInDays: 7,
      start: new Date("2026-11-04T00:00:00.000Z"),
    });
  });

  test("keeps cents exact and treats a month as 30 days", () => {
    const { request, base } = planSpendPermission(parseLimits("$12.50 a month").spec, ids);
    expect(request?.allowance).toBe(BigInt(12_500_000));
    expect(request?.periodInDays).toBe(30);
    expect(base[0]).toEqual(["Spend from Cash", "Up to $12.50 every 30 days"]);
  });

  test("without a spend limit, the permission is the Home daily cap", () => {
    const { request } = planSpendPermission(parseLimits("Bitcoin only").spec, ids);
    expect(request?.allowance).toBe(BigInt(1_000_000_000));
    expect(request?.periodInDays).toBe(1);
  });

  test("what Base can't hold stays with Home", () => {
    const { home } = planSpendPermission(parseLimits("$50 a day, $20 per trade, Bitcoin and Ether only, ask me over $25").spec, ids);
    expect(home).toEqual([["Per trade", "Up to $20.00"], ["Can trade", "Bitcoin, Ether"], ["Asks you", "Over $25.00"]]);
  });

  test("a read-only agent gets no permission", () => {
    expect(planSpendPermission(parseLimits("").spec, { ...ids, readOnly: true }).request).toBeNull();
  });
});
