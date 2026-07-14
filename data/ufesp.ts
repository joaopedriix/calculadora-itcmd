import { identificarMoeda } from "@/services/conversaoMonetariaService"
import type { UfespRecord } from "@/types"

import dadosOficiais from "./ufesp.json"

/**
 * ============================================================================
 * TABELA HISTÓRICA DA UFESP — CARGA INICIAL (SEED)
 * ============================================================================
 *
 * `ufesp.json` é gerado por `scripts/importar-ufesp.ts` (rodar via
 * `npm run importar-ufesp`) a partir da página oficial da Secretaria da
 * Fazenda do Estado de São Paulo — nenhum valor aqui é digitado manualmente.
 *
 * Este arquivo é a ÚNICA peça do sistema que conhece o formato bruto do JSON
 * (datas como string ISO); a partir daqui, tudo passa por
 * `services/ufespService.ts`, que trabalha só com `Date` de verdade.
 */
export interface UfespRecordJson {
  id: string
  dataInicioVigencia: string
  dataFimVigencia: string | null
  valor: number
  baseLegal?: string
  fonte: string
  observacoes?: string
  createdAt: string
  updatedAt: string
}

function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number)
  return new Date(ano, mes - 1, dia)
}

/**
 * Converte um registro no formato bruto do JSON (datas ISO) para o formato
 * usado pelo resto da aplicação (datas `Date`). Reaproveitado pela rota de
 * importação (`app/api/ufesp/importar/route.ts`) e por
 * `services/ufespService.ts` ao aplicar o resultado de uma reimportação —
 * nenhum dos dois deve reimplementar esta conversão.
 */
export function paraRegistro(bruto: UfespRecordJson): UfespRecord {
  const dataInicioVigencia = paraData(bruto.dataInicioVigencia)
  return {
    id: bruto.id,
    dataInicioVigencia,
    dataFimVigencia: bruto.dataFimVigencia ? paraData(bruto.dataFimVigencia) : null,
    ano: dataInicioVigencia.getFullYear(),
    mes: dataInicioVigencia.getMonth() + 1,
    dia: dataInicioVigencia.getDate(),
    valor: bruto.valor,
    // Nunca lida do JSON: sempre derivada da própria data de vigência, para
    // nunca divergir da cadeia histórica oficial (ver
    // services/conversaoMonetariaService.ts).
    moeda: identificarMoeda(dataInicioVigencia).id,
    baseLegal: bruto.baseLegal,
    fonte: bruto.fonte,
    observacoes: bruto.observacoes,
    createdAt: new Date(bruto.createdAt),
    updatedAt: new Date(bruto.updatedAt),
  }
}

export const UFESP_SEED: UfespRecord[] = (dadosOficiais as UfespRecordJson[]).map(paraRegistro)
