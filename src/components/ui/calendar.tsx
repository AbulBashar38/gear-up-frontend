"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
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
          "group/day relative flex-1 p-0 text-center text-sm"
        ),
        day_button: cn(
          defaults.day_button,
          "inline-flex size-9 items-center justify-center rounded-none border-0 p-0 text-sm font-normal text-foreground",
          "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          "hover:bg-muted hover:text-foreground"
        ),
        range_start: cn(defaults.range_start, "bg-primary/10"),
        range_middle: cn(defaults.range_middle, "bg-primary/10"),
        range_end: cn(defaults.range_end, "bg-primary/10"),
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
        DayButton: (dayButtonProps) => (
          <CalendarDayButton {...dayButtonProps} />
        ),
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative z-10 size-9 min-h-0 rounded-none border-0 p-0 font-normal",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:font-bold data-[selected-single=true]:text-primary-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:font-bold data-[range-start=true]:text-primary-foreground",
        "data-[range-middle=true]:bg-primary/10 data-[range-middle=true]:text-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:font-bold data-[range-end=true]:text-primary-foreground",
        "data-[range-start=true]:hover:bg-primary-hover data-[range-start=true]:hover:text-primary-foreground",
        "data-[range-end=true]:hover:bg-primary-hover data-[range-end=true]:hover:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
