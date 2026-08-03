import {
  Backpack,
  Bike,
  Dumbbell,
  PackageOpen,
  TentTree,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GearItem } from "@/lib/api/types";

const cardThemes = [
  "bg-orange text-ink",
  "bg-pine text-paper",
  "bg-lime text-ink",
  "bg-[#d7e5dd] text-ink",
  "bg-[#f0c957] text-ink",
  "bg-[#c9d4ff] text-ink",
];

function GearIcon({ gear }: { gear: Pick<GearItem, "name" | "category"> }) {
  const descriptor = `${gear.category.name} ${gear.name}`.toLowerCase();
  const iconProps = {
    "aria-hidden": true,
    strokeWidth: 1.25,
    className:
      "relative size-28 transition-transform duration-500 group-hover/card:rotate-[-4deg] group-hover/card:scale-105",
  } as const;

  if (descriptor.includes("cycl") || descriptor.includes("bike")) {
    return <Bike {...iconProps} />;
  }
  if (descriptor.includes("camp") || descriptor.includes("tent")) {
    return <TentTree {...iconProps} />;
  }
  if (descriptor.includes("hik") || descriptor.includes("trek")) {
    return <Backpack {...iconProps} />;
  }
  if (descriptor.includes("water") || descriptor.includes("kayak")) {
    return <Waves {...iconProps} />;
  }
  if (descriptor.includes("sport") || descriptor.includes("fitness")) {
    return <Dumbbell {...iconProps} />;
  }

  return <PackageOpen {...iconProps} />;
}

export function formatGearPrice(price: string | number) {
  const numericPrice = Number(price);
  const configuredCurrency = process.env.GEARUP_CURRENCY?.trim().toUpperCase();
  const currency = configuredCurrency?.match(/^[A-Z]{3}$/)
    ? configuredCurrency
    : "USD";

  if (!Number.isFinite(numericPrice)) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
  }).format(numericPrice);
}

type GearCardProps = {
  gear: GearItem;
  index: number;
  eyebrow?: string;
};

export function GearCard({ gear, index, eyebrow }: GearCardProps) {
  const canRequest = gear.isAvailable && gear.stock > 0;

  return (
    <Card
      asChild
      className="h-full gap-0 rounded-none bg-paper py-0 text-ink ring-1 ring-ink/15 shadow-none transition-transform duration-300 hover:-translate-y-1"
    >
      <article>
        <div
          className={`relative grid min-h-56 place-items-center overflow-hidden p-8 ${cardThemes[index % cardThemes.length]}`}
        >
          <div
            aria-hidden="true"
            className="route-grid absolute inset-0 opacity-25"
          />
          <Badge
            variant="outline"
            className="absolute left-4 top-4 h-auto rounded-none border-current/30 bg-transparent px-2 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-current"
          >
            {eyebrow ?? `Field item // ${String(index + 1).padStart(2, "0")}`}
          </Badge>
          <GearIcon gear={gear} />
          <Badge
            variant="outline"
            className="absolute bottom-4 right-4 h-auto rounded-none border-current/30 bg-transparent px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-current"
          >
            {gear.category.name}
          </Badge>
        </div>

        <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-ink/70">
              {gear.brand || "Independent gear"} · {gear.provider.name}
            </p>
            <Badge
              className={`h-auto shrink-0 rounded-none px-2 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] ${
                canRequest
                  ? "bg-lime text-ink hover:bg-lime"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }`}
            >
              {canRequest ? "Open for requests" : "Currently paused"}
            </Badge>
          </div>

          <h3 className="mt-4 font-display text-[2rem] font-black uppercase leading-[0.95] tracking-[-0.035em]">
            {gear.name}
          </h3>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink/70">
            {gear.description}
          </p>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-ink/15 pt-5">
            <div>
              <p className="font-display text-3xl font-black tracking-[-0.03em]">
                {formatGearPrice(gear.pricePerDay)}
              </p>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink/70">
                per rental day
              </p>
            </div>
            <p className="max-w-24 text-right text-[0.66rem] font-bold leading-4 text-ink/70">
              Provider confirms your dates
            </p>
          </div>
        </CardContent>
      </article>
    </Card>
  );
}
