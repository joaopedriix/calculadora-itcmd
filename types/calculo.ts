import type { MoedaSelecionada } from "./moeda"

/**
 * Estratégias de cálculo suportadas. Hoje existe apenas a atualização por
 * UFESP, mas o tipo é uma união literal para permitir novas estratégias
 * (ex.: "atualizacao_selic", "atualizacao_ipca") sem quebrar o contrato.
 */
export type TipoCalculo = "atualizacao_ufesp"

export interface DadosCalculo {
  dataFalecimento: Date
  valorBens: number
  /**
   * Moeda em que `valorBens` foi informado. `"auto"` (padrão) detecta a
   * moeda pela data do falecimento; o advogado pode sobrescrever quando o
   * valor lançado estiver em uma moeda diferente da vigente naquela data
   * (ver `services/conversaoMonetariaService.ts`).
   */
  moedaValorInformado: MoedaSelecionada
  aliquotaItcmd: number
  percentualMulta: number
  tipoCalculo: TipoCalculo
}
