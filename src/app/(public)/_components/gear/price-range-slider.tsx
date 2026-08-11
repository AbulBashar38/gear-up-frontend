"use client";

import { Slider } from "@/components/ui/slider";

export type PriceRangeValue = {
  min: number;
  max: number;
};

type PriceRangeSliderProps = {
  bounds: PriceRangeValue;
  value: PriceRangeValue;
  currency: string;
  onValueChange: (value: PriceRangeValue) => void;
};

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PriceRangeSlider({
  bounds,
  value,
  currency,
  onValueChange,
}: PriceRangeSliderProps) {
  const disabled = bounds.min === bounds.max;

  return (
    <fieldset className="space-y-3 sm:col-span-2 xl:col-span-2">
      <legend className="sr-only">Daily price range</legend>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          aria-hidden="true"
          className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink/70"
        >
          Daily price range
        </span>
        <output className="font-mono text-xs font-bold text-ink" aria-live="polite">
          {formatPrice(value.min, currency)} — {formatPrice(value.max, currency)}
        </output>
      </div>

      <div className="flex h-8 items-center px-1">
        <Slider
          min={bounds.min}
          max={bounds.max}
          step={0.01}
          minStepsBetweenThumbs={0}
          value={[value.min, value.max]}
          disabled={disabled}
          thumbLabels={["Minimum daily price", "Maximum daily price"]}
          onValueChange={(next) => {
            const [min, max] = next;
            if (min === undefined || max === undefined) return;
            onValueChange({ min, max });
          }}
        />
        <input type="hidden" name="minPrice" value={value.min} />
        <input type="hidden" name="maxPrice" value={value.max} />
      </div>

      <div className="flex justify-between font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink/55">
        <span>Lowest {formatPrice(bounds.min, currency)}</span>
        <span>Highest {formatPrice(bounds.max, currency)}</span>
      </div>
    </fieldset>
  );
}
