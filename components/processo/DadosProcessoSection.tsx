import type { UseFormReturn } from "react-hook-form"
import { FileText } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { FormRow } from "@/components/form/FormRow"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CalculoFormValues } from "@/lib/validations"

interface DadosProcessoSectionProps {
  form: UseFormReturn<CalculoFormValues>
}

/** Seção 1 — identificação do processo, cliente e falecido. */
export function DadosProcessoSection({ form }: DadosProcessoSectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <CardTitle>Dados do Processo</CardTitle>
        </div>
        <CardDescription>
          Identificação do processo, do falecido e do cliente. Usado apenas
          para compor o memorial de cálculo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormRow
              id="numeroProcesso"
              label="Número do Processo"
              error={errors.numeroProcesso}
            >
              <Input
                id="numeroProcesso"
                placeholder="0000000-00.0000.0.00.0000"
                aria-invalid={!!errors.numeroProcesso}
                {...register("numeroProcesso")}
              />
            </FormRow>

            <FormRow
              id="nomeCliente"
              label="Nome do Cliente"
              error={errors.nomeCliente}
            >
              <Input
                id="nomeCliente"
                placeholder="Nome completo do cliente"
                aria-invalid={!!errors.nomeCliente}
                {...register("nomeCliente")}
              />
            </FormRow>

            <FormRow
              id="nomeFalecido"
              label="Nome do Falecido"
              error={errors.nomeFalecido}
            >
              <Input
                id="nomeFalecido"
                placeholder="Nome completo do falecido"
                aria-invalid={!!errors.nomeFalecido}
                {...register("nomeFalecido")}
              />
            </FormRow>
          </div>

          <FormRow
            id="observacoes"
            label="Observações"
            error={errors.observacoes}
          >
            <Textarea
              id="observacoes"
              placeholder="Observações livres sobre o caso..."
              className="min-h-20"
              aria-invalid={!!errors.observacoes}
              {...register("observacoes")}
            />
          </FormRow>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
