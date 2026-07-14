import { ShieldCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buscarRegimePorCodigo } from "@/services/conversaoMonetariaService"
import {
  formatDate,
  formatPeriodoVigencia,
  formatValorNaMoeda,
} from "@/utils/formatters"
import type { UfespUtilizada } from "@/types"

interface UfespUtilizadaCardProps {
  ufespUtilizada: UfespUtilizada
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  )
}

/**
 * Mostra a proveniência da UFESP usada no cálculo (data, valor, fonte e
 * observações) para que o advogado possa conferir a origem do dado antes
 * de confiar no resultado.
 */
export function UfespUtilizadaCard({ ufespUtilizada }: UfespUtilizadaCardProps) {
  return (
    <Card className="print:hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>Informações da UFESP utilizada</CardTitle>
        </div>
        <CardDescription>
          Origem do valor de UFESP aplicado ao falecimento informado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Campo
            label="Data encontrada"
            valor={formatDate(ufespUtilizada.dataInicioVigencia)}
          />
          <Campo
            label="Valor da UFESP"
            valor={formatValorNaMoeda(
              ufespUtilizada.valor,
              buscarRegimePorCodigo(ufespUtilizada.moeda).sigla
            )}
          />
          <Campo
            label="Período de vigência"
            valor={formatPeriodoVigencia(
              ufespUtilizada.dataInicioVigencia,
              ufespUtilizada.dataFimVigencia
            )}
          />
          {ufespUtilizada.baseLegal && (
            <Campo label="Base Legal" valor={ufespUtilizada.baseLegal} />
          )}
          <Campo label="Fonte" valor={ufespUtilizada.fonte} />
          {ufespUtilizada.observacoes && (
            <div className="sm:col-span-2">
              <Campo label="Observações" valor={ufespUtilizada.observacoes} />
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
