import { Printer, ScrollText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatDate, formatUfesp } from "@/utils/formatters"
import type { DadosCalculo, DadosProcesso, ResultadoCalculo } from "@/types"

interface MemorialCalculoProps {
  processo: DadosProcesso
  calculo: DadosCalculo
  resultado: ResultadoCalculo
}

function LinhaMemorial({
  label,
  valor,
}: {
  label: string
  valor: string
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:col-span-2">{valor || "—"}</dd>
    </div>
  )
}

/**
 * Memorial de cálculo completo. A marcação semântica (dl/dt/dd) e o layout
 * enxuto foram escolhidos para facilitar a futura exportação em PDF.
 */
export function MemorialCalculo({
  processo,
  calculo,
  resultado,
}: MemorialCalculoProps) {
  return (
    <Card id="memorial-calculo" className="print:border-none print:shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ScrollText className="size-5 text-primary" />
          <CardTitle>Memorial de Cálculo</CardTitle>
        </div>
        <CardDescription>
          Documento de referência com todo o detalhamento do cálculo.
        </CardDescription>
        <CardAction className="print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer />
            Imprimir
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="divide-y">
          <LinhaMemorial label="Número do Processo" valor={processo.numeroProcesso} />
          <LinhaMemorial label="Cliente" valor={processo.nomeCliente} />
          <LinhaMemorial label="Falecido" valor={processo.nomeFalecido} />
          <LinhaMemorial
            label="Data do Falecimento"
            valor={formatDate(calculo.dataFalecimento)}
          />
          <LinhaMemorial
            label="Valor original dos bens"
            valor={formatCurrency(calculo.valorBens)}
          />
          <LinhaMemorial
            label="UFESP utilizada"
            valor={formatCurrency(resultado.ufespEpoca)}
          />
          <LinhaMemorial
            label="Quantidade de UFESP"
            valor={formatUfesp(resultado.quantidadeUfesp)}
          />
          <LinhaMemorial
            label="UFESP Atual"
            valor={formatCurrency(resultado.ufespAtual)}
          />
          <LinhaMemorial
            label="Valor atualizado"
            valor={formatCurrency(resultado.valorAtualizado)}
          />
          <LinhaMemorial
            label="Alíquota aplicada"
            valor={`${calculo.aliquotaItcmd}%`}
          />
          <LinhaMemorial
            label="Valor do ITCMD"
            valor={formatCurrency(resultado.valorItcmd)}
          />
          <LinhaMemorial
            label="Percentual da Multa"
            valor={`${calculo.percentualMulta}%`}
          />
          <LinhaMemorial
            label="Valor da Multa"
            valor={formatCurrency(resultado.valorMulta)}
          />
          <LinhaMemorial
            label="Valor Final"
            valor={formatCurrency(resultado.valorTotal)}
          />
          <LinhaMemorial label="Observações" valor={processo.observacoes ?? ""} />
        </dl>
      </CardContent>
    </Card>
  )
}
