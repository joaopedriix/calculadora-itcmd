import { ClipboardList } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buscarRegimePorCodigo } from "@/services/conversaoMonetariaService"
import { formatCurrency, formatDate, formatValorNaMoeda } from "@/utils/formatters"
import type { ResumoProcessoPreview } from "@/hooks/useResumoProcesso"

interface ResumoProcessoPanelProps {
  resumo: ResumoProcessoPreview
}

function LinhaResumo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{valor}</span>
    </div>
  )
}

/**
 * Painel lateral que acompanha em tempo real o preenchimento do
 * formulário, sem exigir que os dados estejam completos ou válidos.
 */
export function ResumoProcessoPanel({ resumo }: ResumoProcessoPanelProps) {
  return (
    <Card className="print:hidden lg:sticky lg:top-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          <CardTitle>Resumo do Processo</CardTitle>
        </div>
        <CardDescription>Atualizado em tempo real.</CardDescription>
      </CardHeader>
      <CardContent>
        <LinhaResumo label="Cliente" valor={resumo.nomeCliente || "—"} />
        <LinhaResumo label="Falecido" valor={resumo.nomeFalecido || "—"} />
        <LinhaResumo
          label="Data do falecimento"
          valor={resumo.dataFalecimento ? formatDate(resumo.dataFalecimento) : "—"}
        />
        <LinhaResumo
          label="Valor dos bens"
          valor={
            resumo.valorBens && resumo.valorBensMoeda
              ? formatValorNaMoeda(
                  resumo.valorBens,
                  buscarRegimePorCodigo(resumo.valorBensMoeda).sigla
                )
              : "—"
          }
        />

        <Separator className="my-2" />

        <LinhaResumo
          label="UFESP encontrada"
          valor={
            resumo.ufespEncontrada !== null && resumo.ufespMoeda !== null
              ? formatValorNaMoeda(
                  resumo.ufespEncontrada,
                  buscarRegimePorCodigo(resumo.ufespMoeda).sigla
                )
              : "—"
          }
        />
        <LinhaResumo
          label="Valor atualizado"
          valor={
            resumo.valorAtualizado !== null
              ? formatCurrency(resumo.valorAtualizado)
              : "—"
          }
        />

        <Separator className="my-2" />

        <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/5 px-3 py-2.5">
          <span className="text-sm font-semibold">Total da Guia</span>
          <span className="font-bold tabular-nums text-primary">
            {resumo.valorTotal !== null ? formatCurrency(resumo.valorTotal) : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
