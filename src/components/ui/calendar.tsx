"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        months: cn(defaults.months, "relative flex flex-col gap-4 sm:flex-row"),
        month: cn(defaults.month, "flex w-full flex-col gap-4"),
        nav: cn(defaults.nav, "absolute inset-x-0 top-0 flex items-center justify-between"),
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 p-0"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 p-0"
        ),
        month_caption: cn(defaults.month_caption, "flex h-7 items-center justify-center"),
        caption_label: cn(defaults.caption_label, "text-sm font-bold"),
        month_grid: cn(defaults.month_grid, "w-full border-collapse"),
        weekdays: cn(defaults.weekdays, "flex"),
        weekday: cn(
          defaults.weekday,
          "w-9 flex-1 text-[0.7rem] font-semibold text-ink/55"
        ),
        week: cn(defaults.week, "mt-1.5 flex w-full"),
        day: cn(
          defaults.day,
          "relative flex-1 p-0 text-center text-sm",
          "[&:has([data-selected])]:bg-primary/10",
          "[&:has([data-range-middle])]:bg-primary/10",
          "[&:has([data-range-start])]:bg-primary/10 [&:has([data-range-end])]:bg-primary/10"
        ),
        day_button: cn(
          "inline-flex size-9 items-center justify-center rounded-none p-0 text-sm font-normal text-foreground",
          "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          // Unselected hover: subtle fill, text stays readable.
          "hover:bg-muted hover:text-foreground",
          // Selected: dark fill with light text in light mode, and vice versa.
          "data-[selected]:bg-primary data-[selected]:font-bold data-[selected]:text-primary-foreground",
          // Selected + hover must keep the same light-on-dark contrast.
          "data-[selected]:hover:bg-primary-hover data-[selected]:hover:text-primary-foreground"
        ),
        range_start: cn(defaults.range_start, "rounded-none"),
        range_middle: cn(
          defaults.range_middle,
          "[&>button]:bg-transparent [&>button]:text-foreground"
        ),
        range_end: cn(defaults.range_end, "rounded-none"),
        today: cn(defaults.today, "[&>button]:font-bold [&>button]:underline"),
        outside: cn(defaults.outside, "[&>button]:text-ink/35 [&>button]:opacity-60"),
        disabled: cn(defaults.disabled, "[&>button]:pointer-events-none [&>button]:opacity-40"),
        hidden: cn(defaults.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return (
            <Icon
              aria-hidden="true"
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          )
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
