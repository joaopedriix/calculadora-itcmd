import type { FieldError } from "react-hook-form"

import { Field, FieldDescription, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"

interface FormRowProps {
  id: string
  label: string
  description?: string
  error?: FieldError
  required?: boolean
  children: React.ReactNode
}

/**
 * Agrupa label, controle e mensagem de erro de um campo, evitando repetir
 * essa composição em cada seção do formulário.
 */
export function FormRow({
  id,
  label,
  description,
  error,
  required,
  children,
}: FormRowProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldErrorMessage errors={error ? [error] : []} />
    </Field>
  )
}
