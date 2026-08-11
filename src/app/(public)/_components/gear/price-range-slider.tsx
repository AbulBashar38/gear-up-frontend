"use client";

import { cn } from "@/lib/utils";

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

function percentage(value: number, bounds: PriceRangeValue) {
  if (bounds.max <= bounds.min) return 0;
  return ((value - bounds.min) / (bounds.max - bounds.min)) * 100;
}

const RANGE_INPUT_CLASS = cn(
  "pointer-events-none absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent outline-none",
  "focus-visible:z-30",
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent",
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-paper [&::-webkit-slider-thumb]:bg-signal [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--ink)]",
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-transparent",
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-paper [&::-moz-range-thumb]:bg-signal [&::-moz-range-thumb]:shadow-[0_0_0_2px_var(--ink)]",
);

export function PriceRangeSlider({
  bounds,
  value,
  currency,
  onValueChange,
}: PriceRangeSliderProps) {
  const minPercent = percentage(value.min, bounds);
  const maxPercent = percentage(value.max, bounds);
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

      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink/15" />
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          id="minPrice"
          name="minPrice"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step="0.01"
          value={value.min}
          disabled={disabled}
          aria-label="Minimum daily price"
          className={RANGE_INPUT_CLASS}
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), value.max);
            onValueChange({ ...value, min: next });
          }}
        />
        <input
          id="maxPrice"
          name="maxPrice"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step="0.01"
          value={value.max}
          disabled={disabled}
          aria-label="Maximum daily price"
          className={RANGE_INPUT_CLASS}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), value.min);
            onValueChange({ ...value, max: next });
          }}
        />
      </div>

      <div className="flex justify-between font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink/55">
        <span>Lowest {formatPrice(bounds.min, currency)}</span>
        <span>Highest {formatPrice(bounds.max, currency)}</span>
      </div>
    </fieldset>
  );
}
