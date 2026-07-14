"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/utils/formatters"

interface DatePickerProps {
  id?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  "aria-invalid"?: boolean
}

/**
 * Seletor de data reutilizável. Permite navegar rapidamente por décadas via
 * dropdown de mês/ano — essencial aqui, já que óbitos podem ser antigos.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={props["aria-invalid"]}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-full justify-start gap-2 font-normal",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="size-4 shrink-0" />
        {value ? formatDate(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ptBR}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date()}
          selected={value}
          defaultMonth={value}
          disabled={{ after: new Date() }}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
