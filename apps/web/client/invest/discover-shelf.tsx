import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { StatusMark } from "@/components/ui/status-texture";
import { ShimmerRows } from "@/client/home/panel-shared";
import type { InvestAsset } from "@/config/invest-assets";
import type { AssetMarkResolution } from "@/client/asset-mark/presentation";
import type { MarketDataState } from "@/shared/invest/invest-market";
import type { MemeShelfStatus } from "./discover";
import { DiscoverAssetRow } from "./discover-asset-row";

export function DiscoverShelf({
  title,
  headingLevel = 3,
  assets,
  market,
  status = "ready",
  assetMarkResolution = {},
  onSeeAll,
  onOpenAsset,
}: {
  title: string;
  headingLevel?: 2 | 3;
  assets: readonly InvestAsset[];
  market: MarketDataState;
  status?: MemeShelfStatus;
  assetMarkResolution?: AssetMarkResolution;
  onSeeAll: () => void;
  onOpenAsset: (asset: InvestAsset) => void;
}) {
  const titleId = `${title.toLowerCase()}-shelf-title`;

  return (
    <section aria-labelledby={titleId}>
      <Card>
        <CardHeader>
          <SectionHeader
            headingId={titleId}
            title={title}
            ariaLevel={headingLevel}
            action={
              <Button variant="ghost" size="card-action" onClick={onSeeAll}>
                See all
                <ChevronRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            }
          />
        </CardHeader>
        <CardContent inset="list">
          {assets.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {assets.map((asset) => (
                <DiscoverAssetRow
                  key={asset.id}
                  asset={asset}
                  market={market}
                  assetMarkResolution={assetMarkResolution}
                  onOpen={() => onOpenAsset(asset)}
                />
              ))}
            </ul>
          ) : status === "loading" ? (
            <div role="status">
              <ShimmerRows count={3} />
              <span className="sr-only">Loading {title.toLowerCase()}</span>
            </div>
          ) : status === "error" || status === "unavailable" ? (
            <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <StatusMark texture="cant-load" />
              Can’t load {title.toLowerCase()} right now
            </p>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">Nothing trending</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

