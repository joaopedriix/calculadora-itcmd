"use client"

import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/utils/formatters"

interface CurrencyInputProps {
  id?: string
  value: number | undefined
  onChange: (value: number) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  "aria-invalid"?: boolean
}

/**
 * Campo monetário mascarado em BRL. O usuário digita apenas números
 * (da direita para a esquerda) e o valor é formatado automaticamente,
 * como em "R$ 1.234,56".
 */
export function CurrencyInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "R$ 0,00",
  disabled,
  ...props
}: CurrencyInputProps) {
  return (
    <Input
      id={id}
      inputMode="decimal"
      placeholder={placeholder}
      disabled={disabled}
      value={value ? formatCurrency(value) : ""}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "")
        onChange(digits ? Number(digits) / 100 : 0)
      }}
      onBlur={onBlur}
      aria-invalid={props["aria-invalid"]}
    />
  )
}
