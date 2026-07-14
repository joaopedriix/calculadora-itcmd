import { Banknote } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrencyPreciso } from "@/utils/formatters"
import type { ConversaoMonetaria, ConversaoMonetariaDetalhe } from "@/types"

interface ConversaoMonetariaCardProps {
  conversaoMonetaria: ConversaoMonetaria
}

const formatadorFator = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 })

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  )
}

function BlocoConversao({
  titulo,
  detalhe,
}: {
  titulo: string
  detalhe: ConversaoMonetariaDetalhe
}) {
  const { moeda, valorOriginal, valorConvertido } = detalhe
  const jaEmReal = moeda.id === "real"

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{titulo}</h4>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Campo label="Moeda original" valor={`${moeda.moeda} (${moeda.sigla})`} />
        <Campo
          label="Valor original"
          valor={`${moeda.sigla} ${valorOriginal.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
        <Campo label="Moeda final" valor="Real (R$)" />
        <Campo label="Valor convertido" valor={formatCurrencyPreciso(valorConvertido)} />
        <Campo
          label="Fator de conversão"
          valor={
            jaEmReal
              ? "Não se aplica (já em Real)"
              : `÷ ${formatadorFator.format(moeda.fatorConversao)}`
          }
        />
        <Campo label="Base legal" valor={moeda.baseLegal} />
        <Campo label="Fonte" valor={moeda.fonte} />
      </dl>
    </div>
  )
}

/**
 * Card de auditoria: mostra passo a passo como o valor dos bens e a UFESP da
 * época foram convertidos para Real antes da divisão que apura a quantidade
 * de UFESP — nenhuma conversão fica oculta, o advogado precisa conseguir
 * conferir exatamente como o sistema chegou ao valor final.
 */
export function ConversaoMonetariaCard({ conversaoMonetaria }: ConversaoMonetariaCardProps) {
  return (
    <Card className="print:hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Banknote className="size-5 text-primary" />
          <CardTitle>Conversão Monetária</CardTitle>
        </div>
        <CardDescription>
          Passo a passo da conversão para Real antes do cálculo da quantidade de UFESP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BlocoConversao titulo="Valor dos bens" detalhe={conversaoMonetaria.valorBens} />
        <BlocoConversao titulo="UFESP da época" detalhe={conversaoMonetaria.ufespEpoca} />
      </CardContent>
    </Card>
  )
}
