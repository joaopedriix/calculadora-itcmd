import { Controller, type UseFormReturn } from "react-hook-form"
import { Calculator } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { FormRow } from "@/components/form/FormRow"
import { CurrencyInput } from "@/components/form/CurrencyInput"
import { DatePicker } from "@/components/form/DatePicker"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TIPOS_CALCULO } from "@/constants/tiposCalculo"
import type { CalculoFormValues } from "@/lib/validations"

interface DadosCalculoSectionProps {
  form: UseFormReturn<CalculoFormValues>
}

const ITEMS_TIPO_CALCULO = Object.fromEntries(
  TIPOS_CALCULO.map(({ value, label }) => [value, label])
)

/** Seção 2 — dados que efetivamente alimentam o cálculo de ITCMD. */
export function DadosCalculoSection({ form }: DadosCalculoSectionProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <CardTitle>Dados do Cálculo</CardTitle>
        </div>
        <CardDescription>
          Informações usadas para localizar a UFESP da época e apurar o
          valor da guia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormRow
              id="dataFalecimento"
              label="Data do Falecimento"
              error={errors.dataFalecimento}
              required
            >
              <Controller
                control={control}
                name="dataFalecimento"
                render={({ field }) => (
                  <DatePicker
                    id="dataFalecimento"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={!!errors.dataFalecimento}
                  />
                )}
              />
            </FormRow>

            <FormRow
              id="valorBens"
              label="Valor dos Bens"
              error={errors.valorBens}
              required
            >
              <Controller
                control={control}
                name="valorBens"
                render={({ field }) => (
                  <CurrencyInput
                    id="valorBens"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={!!errors.valorBens}
                  />
                )}
              />
            </FormRow>

            <FormRow
              id="aliquotaItcmd"
              label="Alíquota do ITCMD (%)"
              error={errors.aliquotaItcmd}
            >
              <Input
                id="aliquotaItcmd"
                type="number"
                step="0.01"
                min={0}
                max={100}
                aria-invalid={!!errors.aliquotaItcmd}
                {...register("aliquotaItcmd", { valueAsNumber: true })}
              />
            </FormRow>

            <FormRow
              id="percentualMulta"
              label="Multa (%)"
              error={errors.percentualMulta}
            >
              <Input
                id="percentualMulta"
                type="number"
                step="0.01"
                min={0}
                max={100}
                aria-invalid={!!errors.percentualMulta}
                {...register("percentualMulta", { valueAsNumber: true })}
              />
            </FormRow>
          </div>

          <FormRow
            id="tipoCalculo"
            label="Tipo de Cálculo"
            error={errors.tipoCalculo}
          >
            <Controller
              control={control}
              name="tipoCalculo"
              render={({ field }) => (
                <Select
                  items={ITEMS_TIPO_CALCULO}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="tipoCalculo" className="w-full">
                    <SelectValue placeholder="Selecione o tipo de cálculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CALCULO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
