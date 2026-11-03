import { describe, expect, test } from "bun:test";
import { DEFAULT_LIMITS, describeLimits, parseLimits } from "./agent-limits";

const untouched = { spend: null, perTrade: null, askOver: 0, assets: null, blockedAssets: [] };

describe("parseLimits", () => {
  test("reads spend, per-trade, asking and assets from one sentence", () => {
    const { spec, understood, missed } = parseLimits("Up to $50 a day, $20 per trade, ask me over $25, Bitcoin and Ether only");
    expect(spec.spend).toEqual({ amount: 50, period: "day" });
    expect(spec.perTrade).toBe(20);
    expect(spec.askOver).toBe(25);
    expect(spec.assets).toEqual(["Bitcoin", "Ether"]);
    expect(understood).toEqual(["Spend up to $50.00 a day", "Up to $20.00 a trade", "Asks you over $25.00", "Only Bitcoin and Ether"]);
    expect(missed).toEqual([]);
  });

  test("blocks assets and switches asking off", () => {
    const { spec } = parseLimits("$300 a week, no Solana, don't ask");
    expect(spec.spend).toEqual({ amount: 300, period: "week" });
    expect(spec.blockedAssets).toEqual(["Solana"]);
    expect(spec.askOver).toBeNull();
    expect(describeLimits(spec)).toContainEqual(["Can trade", "Bitcoin, Ether, Cash"]);
  });

  test("refuses what an agent can never do, and says why", () => {
    const { refused, spec } = parseLimits("send profits to my bank, let it raise its own limits, $5,000 a day");
    expect(refused.map((r) => r.reason)).toEqual([
      "Agents can't send money out of Home. They trade inside their own portfolio.",
      "Only you can change an agent's limits.",
      "Agents can spend up to $1,000.00 a day in Home.",
    ]);
    expect(spec).toEqual(untouched);
  });

  test("keeps what it didn't understand", () => {
    expect(parseLimits("Bitcoin only, nothing too spicy").missed).toEqual(["nothing too spicy"]);
  });

  test("never sending money is a limit, not a refusal", () => {
    const { refused, missed } = parseLimits("never send money out");
    expect(refused).toEqual([]);
    expect(missed).toEqual(["never send money out"]);
  });

  test("starts by asking before every trade", () => {
    expect(describeLimits(DEFAULT_LIMITS)).toContainEqual(["Asks you", "Before every trade"]);
  });
});
