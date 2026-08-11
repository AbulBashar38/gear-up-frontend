"use client"

import * as React from "react"
import { CalendarDays, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DateRangeValue = {
  from: string
  to: string
}

type DateRangePickerProps = {
  id?: string
  startName: string
  endName: string
  value: DateRangeValue
  onValueChange: (value: DateRangeValue) => void
  minimumDate?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

function parseDateValue(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day, 12)
}

function formatDateValue(date?: Date): string {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const displayFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function DateRangePicker({
  id,
  startName,
  endName,
  value,
  onValueChange,
  minimumDate,
  placeholder = "Select availability dates",
  disabled,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected: DateRange | undefined = value.from
    ? { from: parseDateValue(value.from), to: parseDateValue(value.to) }
    : undefined
  const minimum = parseDateValue(minimumDate)
  const label = selected?.from
    ? selected.to
      ? `${displayFormatter.format(selected.from)} — ${displayFormatter.format(selected.to)}`
      : `${displayFormatter.format(selected.from)} — Select end date`
    : placeholder

  function commit(range?: DateRange) {
    const next = {
      from: formatDateValue(range?.from),
      to: formatDateValue(range?.to),
    }
    onValueChange(next)
    if (next.from && next.to) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected?.from}
          aria-label={`Availability date range: ${label}`}
          className={cn(
            "h-10 w-full justify-start gap-2 overflow-hidden px-3 font-medium",
            "data-[empty=true]:text-ink/55 data-[empty=true]:hover:text-primary-foreground data-[empty=true]:aria-expanded:text-primary-foreground",
            className
          )}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-4">
        <Calendar
          mode="range"
          autoFocus
          selected={selected}
          defaultMonth={selected?.from ?? minimum}
          disabled={minimum ? { before: minimum } : undefined}
          onSelect={commit}
        />
        {(value.from || value.to) && (
          <div className="mt-3 border-t border-ink/12 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="compact"
              onClick={() => commit(undefined)}
            >
              <X aria-hidden="true" />
              Clear dates
            </Button>
          </div>
        )}
      </PopoverContent>
      <input readOnly type="hidden" name={startName} value={value.from} />
      <input readOnly type="hidden" name={endName} value={value.to} />
    </Popover>
  )
}
