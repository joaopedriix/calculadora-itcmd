"use client"

import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { DadosCalculoSection } from "@/components/calculo/DadosCalculoSection"
import { MemorialCalculo } from "@/components/calculo/MemorialCalculo"
import { ResultadoCalculo } from "@/components/calculo/ResultadoCalculo"
import { UfespUtilizadaCard } from "@/components/calculo/UfespUtilizadaCard"
import { PageHeader } from "@/components/layout/PageHeader"
import { DadosProcessoSection } from "@/components/processo/DadosProcessoSection"
import { ResumoProcessoPanel } from "@/components/processo/ResumoProcessoPanel"
import { Button } from "@/components/ui/button"
import { ALIQUOTA_ITCMD_PADRAO, PERCENTUAL_MULTA_PADRAO } from "@/constants/calculo"
import { useResumoProcesso } from "@/hooks/useResumoProcesso"
import { calculoFormSchema, type CalculoFormValues } from "@/lib/validations"
import { UfespNaoEncontradaError, executarCalculo } from "@/services/calculoService"
import type { ResultadoCalculo as ResultadoCalculoType } from "@/types"

export default function CalcularPage() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [resultado, setResultado] = useState<ResultadoCalculoType | null>(null)

  const form = useForm<CalculoFormValues>({
    resolver: zodResolver(calculoFormSchema),
    defaultValues: {
      numeroProcesso: "",
      nomeFalecido: "",
      nomeCliente: "",
      observacoes: "",
      valorBens: 0,
      aliquotaItcmd: ALIQUOTA_ITCMD_PADRAO,
      percentualMulta: PERCENTUAL_MULTA_PADRAO,
      tipoCalculo: "atualizacao_ufesp",
    },
  })

  const valoresObservados = useWatch({ control: form.control })
  const resumo = useResumoProcesso(valoresObservados)

  async function onSubmit(dados: CalculoFormValues) {
    setIsCalculating(true)
    setResultado(null)

    try {
      // pequena espera para tornar o feedback de carregamento perceptível
      await new Promise((resolve) => setTimeout(resolve, 500))

      setResultado(executarCalculo(dados))
      toast.success("Cálculo realizado com sucesso.")
    } catch (error) {
      if (error instanceof UfespNaoEncontradaError) {
        toast.error(error.message)
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Não foi possível concluir o cálculo. Tente novamente.")
      }
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Calcular ITCMD"
        description="Atualização de patrimônio e apuração de guia via UFESP."
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid items-start gap-6 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex flex-col gap-6 print:hidden">
              <DadosProcessoSection form={form} />
              <DadosCalculoSection form={form} />

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isCalculating}>
                  {isCalculating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Calculator />
                  )}
                  Calcular
                </Button>
              </div>
            </div>

            {resultado && (
              <>
                <ResultadoCalculo resultado={resultado} />
                <UfespUtilizadaCard ufespUtilizada={resultado.ufespUtilizada} />
                <MemorialCalculo
                  processo={{
                    numeroProcesso: form.getValues("numeroProcesso"),
                    nomeFalecido: form.getValues("nomeFalecido"),
                    nomeCliente: form.getValues("nomeCliente"),
                    observacoes: form.getValues("observacoes"),
                  }}
                  calculo={form.getValues()}
                  resultado={resultado}
                />
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <ResumoProcessoPanel resumo={resumo} />
          </div>
        </form>
      </main>
    </div>
  )
}
