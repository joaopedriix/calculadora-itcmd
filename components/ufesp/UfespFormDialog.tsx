"use client"

import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { CurrencyInput } from "@/components/form/CurrencyInput"
import { DatePicker } from "@/components/form/DatePicker"
import { FormRow } from "@/components/form/FormRow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ufespFormSchema, type UfespFormValues } from "@/lib/validations"
import type { UfespRecord } from "@/types"

export type UfespFormMode = "criar" | "editar" | "visualizar"

interface UfespFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: UfespFormMode
  registro?: UfespRecord
  onSalvar: (dados: UfespFormValues) => void
}

const TITULOS: Record<UfespFormMode, string> = {
  criar: "Nova UFESP",
  editar: "Editar UFESP",
  visualizar: "Detalhes da UFESP",
}

function valoresPadrao(registro?: UfespRecord): UfespFormValues {
  return {
    dataInicioVigencia: registro?.dataInicioVigencia ?? new Date(),
    dataFimVigencia: registro?.dataFimVigencia ?? null,
    valor: registro?.valor ?? 0,
    baseLegal: registro?.baseLegal ?? "",
    fonte: registro?.fonte ?? "",
    observacoes: registro?.observacoes ?? "",
  }
}

export function UfespFormDialog({
  open,
  onOpenChange,
  mode,
  registro,
  onSalvar,
}: UfespFormDialogProps) {
  const somenteLeitura = mode === "visualizar"

  const form = useForm<UfespFormValues>({
    resolver: zodResolver(ufespFormSchema),
    defaultValues: valoresPadrao(registro),
  })

  useEffect(() => {
    if (open) {
      form.reset(valoresPadrao(registro))
    }
  }, [open, registro, form])

  const dataInicioVigencia = useWatch({
    control: form.control,
    name: "dataInicioVigencia",
  })
  const dataFimVigencia = useWatch({
    control: form.control,
    name: "dataFimVigencia",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{TITULOS[mode]}</DialogTitle>
          <DialogDescription>
            Período de vigência, valor e proveniência do registro de UFESP.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((dados) => onSalvar(dados))}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow
                id="dataInicioVigencia"
                label="Data Inicial de Vigência"
                error={form.formState.errors.dataInicioVigencia}
                required
              >
                <Controller
                  control={form.control}
                  name="dataInicioVigencia"
                  render={({ field }) => (
                    <DatePicker
                      id="dataInicioVigencia"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={somenteLeitura}
                      aria-invalid={!!form.formState.errors.dataInicioVigencia}
                    />
                  )}
                />
              </FormRow>

              <FormRow
                id="dataFimVigencia"
                label="Data Final de Vigência"
                error={form.formState.errors.dataFimVigencia}
              >
                <div className="flex flex-col gap-2">
                  <DatePicker
                    id="dataFimVigencia"
                    value={dataFimVigencia ?? undefined}
                    onChange={(data) =>
                      form.setValue("dataFimVigencia", data ?? null, {
                        shouldValidate: true,
                      })
                    }
                    disabled={somenteLeitura || dataFimVigencia === null}
                    placeholder="Ainda vigente"
                  />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={dataFimVigencia === null}
                      disabled={somenteLeitura}
                      onCheckedChange={(marcado) =>
                        form.setValue(
                          "dataFimVigencia",
                          marcado ? null : new Date(),
                          { shouldValidate: true }
                        )
                      }
                    />
                    Ainda vigente (sem data final)
                  </label>
                </div>
              </FormRow>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Derivado automaticamente da data inicial:
              </span>
              <Badge variant="secondary">Ano {dataInicioVigencia?.getFullYear()}</Badge>
              <Badge variant="secondary">
                Mês {dataInicioVigencia ? dataInicioVigencia.getMonth() + 1 : "—"}
              </Badge>
              <Badge variant="secondary">
                Dia {dataInicioVigencia?.getDate()}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow
                id="valor"
                label="Valor da UFESP"
                error={form.formState.errors.valor}
                required
              >
                <Controller
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <CurrencyInput
                      id="valor"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={somenteLeitura}
                      aria-invalid={!!form.formState.errors.valor}
                    />
                  )}
                />
              </FormRow>

              <FormRow
                id="fonte"
                label="Fonte"
                error={form.formState.errors.fonte}
                required
              >
                <Input
                  id="fonte"
                  placeholder="Ex.: SEFAZ-SP, Diário Oficial..."
                  disabled={somenteLeitura}
                  aria-invalid={!!form.formState.errors.fonte}
                  {...form.register("fonte")}
                />
              </FormRow>
            </div>

            <FormRow id="baseLegal" label="Base Legal" error={form.formState.errors.baseLegal}>
              <Input
                id="baseLegal"
                placeholder="Ex.: Comunicado DICAR-88/25, de 17-12-2025"
                disabled={somenteLeitura}
                {...form.register("baseLegal")}
              />
            </FormRow>

            <FormRow
              id="observacoes"
              label="Observações"
              error={form.formState.errors.observacoes}
            >
              <Textarea
                id="observacoes"
                placeholder="Observações sobre este registro..."
                disabled={somenteLeitura}
                {...form.register("observacoes")}
              />
            </FormRow>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {somenteLeitura ? "Fechar" : "Cancelar"}
            </Button>
            {!somenteLeitura && <Button type="submit">Salvar</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
