import { CheckCircle2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buscarRegimePorCodigo } from "@/services/conversaoMonetariaService"
import { formatCurrency, formatUfesp, formatValorNaMoeda } from "@/utils/formatters"
import type { ResultadoCalculo as ResultadoCalculoType } from "@/types"

interface ResultadoCalculoProps {
  resultado: ResultadoCalculoType
}

function LinhaResultado({
  label,
  valor,
}: {
  label: string
  valor: string
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{valor}</span>
    </div>
  )
}

export function ResultadoCalculo({ resultado }: ResultadoCalculoProps) {
  return (
    <Card className="border-primary/20 print:hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-primary" />
          <CardTitle>Resultado do Cálculo</CardTitle>
        </div>
        <CardDescription>
          Valores apurados pela atualização via UFESP.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          <LinhaResultado
            label="UFESP utilizada (época)"
            valor={formatValorNaMoeda(
              resultado.ufespUtilizada.valor,
              buscarRegimePorCodigo(resultado.ufespUtilizada.moeda).simbolo
            )}
          />
          <LinhaResultado
            label="UFESP atual"
            valor={formatCurrency(resultado.ufespAtual)}
          />
          <LinhaResultado
            label="Quantidade de UFESP"
            valor={formatUfesp(resultado.quantidadeUfesp)}
          />
          <LinhaResultado
            label="Valor atualizado do patrimônio"
            valor={formatCurrency(resultado.valorAtualizado)}
          />
          <LinhaResultado
            label="Valor do ITCMD"
            valor={formatCurrency(resultado.valorItcmd)}
          />
          <LinhaResultado
            label="Valor da multa"
            valor={formatCurrency(resultado.valorMulta)}
          />
        </div>

        <Separator className="my-2" />

        <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-3">
          <span className="font-semibold">Valor Total da Guia</span>
          <span className="text-lg font-bold tabular-nums text-primary">
            {formatCurrency(resultado.valorTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
