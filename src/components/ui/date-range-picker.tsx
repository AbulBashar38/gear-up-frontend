"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
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

type DatePickerWithRangeProps = {
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

const TWO_MONTHS_QUERY = "(min-width: 640px)"

function subscribeToTwoMonths(callback: () => void) {
  const mediaQuery = window.matchMedia(TWO_MONTHS_QUERY)
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getTwoMonthsSnapshot() {
  return window.matchMedia(TWO_MONTHS_QUERY).matches
}

function getServerTwoMonthsSnapshot() {
  return false
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

export function DatePickerWithRange({
  id,
  startName,
  endName,
  value,
  onValueChange,
  minimumDate,
  placeholder = "Select availability dates",
  disabled,
  className,
}: DatePickerWithRangeProps) {
  const showTwoMonths = React.useSyncExternalStore(
    subscribeToTwoMonths,
    getTwoMonthsSnapshot,
    getServerTwoMonthsSnapshot
  )
  const selected: DateRange | undefined = value.from
    ? { from: parseDateValue(value.from), to: parseDateValue(value.to) }
    : undefined
  const minimum = parseDateValue(minimumDate)
  const label = selected?.from
    ? selected.to
      ? `${format(selected.from, "LLL dd, y")} - ${format(selected.to, "LLL dd, y")}`
      : format(selected.from, "LLL dd, y")
    : placeholder

  function commit(range?: DateRange) {
    const next = {
      from: formatDateValue(range?.from),
      to: formatDateValue(range?.to),
    }
    onValueChange(next)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected?.from}
          aria-label={`Availability date range: ${label}`}
          className={cn(
            "h-10 w-full justify-start gap-2 overflow-hidden px-2.5 font-normal",
            "data-[empty=true]:text-ink/55 data-[empty=true]:hover:text-primary-foreground data-[empty=true]:aria-expanded:text-primary-foreground",
            className
          )}
        >
          <CalendarIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0"
      >
        <Calendar
          mode="range"
          defaultMonth={selected?.from ?? minimum}
          selected={selected}
          onSelect={commit}
          numberOfMonths={showTwoMonths ? 2 : 1}
          disabled={minimum ? { before: minimum } : undefined}
        />
      </PopoverContent>
      <input readOnly type="hidden" name={startName} value={value.from} />
      <input readOnly type="hidden" name={endName} value={value.to} />
    </Popover>
  )
}
