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
import {
  formatCurrency,
  formatCurrencyPreciso,
  formatDate,
  formatPeriodoVigencia,
  formatUfesp,
} from "@/utils/formatters"
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
            label="Moeda original do valor dos bens"
            valor={`${resultado.conversaoMonetaria.valorBens.moeda.nome} (${resultado.conversaoMonetaria.valorBens.moeda.simbolo})`}
          />
          <LinhaMemorial
            label="Valor original dos bens"
            valor={formatCurrency(calculo.valorBens)}
          />
          <LinhaMemorial
            label="Valor dos bens convertido para Real"
            valor={formatCurrencyPreciso(resultado.conversaoMonetaria.valorBens.valorConvertido)}
          />
          <LinhaMemorial
            label="Fator de conversão (valor dos bens)"
            valor={
              resultado.conversaoMonetaria.valorBens.moeda.codigo === "real"
                ? "Não se aplica (já em Real)"
                : `÷ ${resultado.conversaoMonetaria.valorBens.moeda.fatorParaReal.toLocaleString("pt-BR")}`
            }
          />
          <LinhaMemorial
            label="Base legal da conversão (valor dos bens)"
            valor={resultado.conversaoMonetaria.valorBens.moeda.baseLegal}
          />
          <LinhaMemorial
            label="Data da UFESP utilizada"
            valor={formatDate(resultado.ufespUtilizada.dataInicioVigencia)}
          />
          <LinhaMemorial
            label="UFESP original (moeda da época)"
            valor={`${resultado.conversaoMonetaria.ufespEpoca.moeda.simbolo} ${resultado.ufespUtilizada.valor.toLocaleString(
              "pt-BR",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`}
          />
          <LinhaMemorial
            label="UFESP convertida para Real"
            valor={formatCurrencyPreciso(resultado.conversaoMonetaria.ufespEpoca.valorConvertido)}
          />
          <LinhaMemorial
            label="Fator de conversão (UFESP da época)"
            valor={
              resultado.conversaoMonetaria.ufespEpoca.moeda.codigo === "real"
                ? "Não se aplica (já em Real)"
                : `÷ ${resultado.conversaoMonetaria.ufespEpoca.moeda.fatorParaReal.toLocaleString("pt-BR")}`
            }
          />
          <LinhaMemorial
            label="Período de vigência"
            valor={formatPeriodoVigencia(
              resultado.ufespUtilizada.dataInicioVigencia,
              resultado.ufespUtilizada.dataFimVigencia
            )}
          />
          <LinhaMemorial
            label="Base Legal"
            valor={resultado.ufespUtilizada.baseLegal ?? ""}
          />
          <LinhaMemorial
            label="Fonte da informação"
            valor={resultado.ufespUtilizada.fonte}
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
