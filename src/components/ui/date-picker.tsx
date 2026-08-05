"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/** Convert a `YYYY-MM-DD` string into a local-noon Date (avoids UTC drift). */
function parseDateValue(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day, 12)
}

/** Format a Date back into a timezone-safe `YYYY-MM-DD` string. */
function formatDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const displayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
})

type DatePickerFieldProps = {
  /** Form field name — submitted as a `YYYY-MM-DD` string via a hidden input. */
  name: string
  id?: string
  defaultValue?: string
  /** Controlled value (`YYYY-MM-DD`); pair with `onValueChange`. */
  value?: string
  onValueChange?: (value: string) => void
  /** Earliest selectable date, inclusive (`YYYY-MM-DD`). */
  min?: string
  placeholder?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  className?: string
}

export function DatePickerField({
  name,
  id,
  defaultValue,
  value: controlledValue,
  onValueChange,
  min,
  placeholder = "Select a date",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DatePickerFieldProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const value = isControlled ? controlledValue : internalValue
  const [open, setOpen] = React.useState(false)

  const selected = parseDateValue(value)
  const minDate = parseDateValue(min)

  function commit(next: string) {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          data-empty={!selected}
          className={cn(
            "h-12 w-full justify-start gap-2 px-4 font-medium",
            "data-[empty=true]:text-ink/55 data-[empty=true]:hover:text-primary-foreground data-[empty=true]:aria-expanded:text-primary-foreground",
            className
          )}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          {selected ? displayFormatter.format(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          autoFocus
          selected={selected}
          defaultMonth={selected ?? minDate}
          disabled={minDate ? { before: minDate } : undefined}
          onSelect={(date) => {
            commit(date ? formatDateValue(date) : "")
            if (date) setOpen(false)
          }}
        />
      </PopoverContent>
      {/* Submitted value for the Server Action FormData. */}
      <input type="hidden" name={name} value={value} />
    </Popover>
  )
}
