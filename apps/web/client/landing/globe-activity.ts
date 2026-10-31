import type { GlobePoint } from "./globe-geometry";

export const ACTIVITY_INTERVAL_MS = 700;
export const ACTIVITY_DURATION_MS = 1_600;
export const ACTIVITY_SLOTS = 4;
const ACTIVITY_JITTER_MS = 200;

export type ActivityPing = {
  slot: number;
  point: GlobePoint;
  progress: number;
};

function hash(value: number) {
  let x = Math.imul(value ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return x >>> 0;
}

export function groupActivityPoints(points: readonly GlobePoint[]): GlobePoint[][] {
  const groups = new Map<string, GlobePoint[]>();
  for (const point of points) {
    const key = point.currency.code ?? point.countryCode;
    groups.set(key, [...(groups.get(key) ?? []), point]);
  }
  return [...groups.keys()].sort().map((key) => groups.get(key)!);
}

export function simulatedActivityAt(time: number, groups: readonly (readonly GlobePoint[])[]): ActivityPing[] {
  if (groups.length === 0 || !Number.isFinite(time) || time < 0) return [];
  const pings: ActivityPing[] = [];
  const last = Math.floor(time / ACTIVITY_INTERVAL_MS);
  const first = Math.max(0, Math.floor((time - ACTIVITY_DURATION_MS - ACTIVITY_JITTER_MS) / ACTIVITY_INTERVAL_MS));
  for (let index = first; index <= last; index++) {
    const seed = hash(index);
    const start = index * ACTIVITY_INTERVAL_MS + (seed % ACTIVITY_JITTER_MS);
    const progress = (time - start) / ACTIVITY_DURATION_MS;
    if (progress < 0 || progress >= 1) continue;
    const group = groups[seed % groups.length]!;
    const point = group[hash(seed) % group.length]!;
    pings.push({ slot: index % ACTIVITY_SLOTS, point, progress });
  }
  return pings;
}
