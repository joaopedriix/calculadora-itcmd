/**
 * Estratégias de cálculo suportadas. Hoje existe apenas a atualização por
 * UFESP, mas o tipo é uma união literal para permitir novas estratégias
 * (ex.: "atualizacao_selic", "atualizacao_ipca") sem quebrar o contrato.
 */
export type TipoCalculo = "atualizacao_ufesp"

export interface DadosCalculo {
  dataFalecimento: Date
  valorBens: number
  aliquotaItcmd: number
  percentualMulta: number
  tipoCalculo: TipoCalculo
}
