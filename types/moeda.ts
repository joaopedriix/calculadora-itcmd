/**
 * Identifica cada padrão monetário brasileiro desde 1942. O sufixo numérico
 * distingue as três vezes em que a moeda se chamou "Cruzeiro" — cada uma tem
 * um fator de conversão para Real completamente diferente (ordens de
 * grandeza distintas), então nunca podem ser tratadas como a mesma opção.
 */
export type CodigoMoeda =
  | "cruzeiro_1942"
  | "cruzeiro_novo"
  | "cruzeiro_1970"
  | "cruzado"
  | "cruzado_novo"
  | "cruzeiro_1990"
  | "cruzeiro_real"
  | "real"

/** Valor especial do campo "Moeda do Valor Informado": detectar pela data do falecimento. */
export const MOEDA_AUTOMATICA = "auto" as const
export type MoedaSelecionada = CodigoMoeda | typeof MOEDA_AUTOMATICA

/** Um padrão monetário histórico, com o fator para converter 1 unidade dele em Real. */
export interface RegimeMonetario {
  codigo: CodigoMoeda
  nome: string
  simbolo: string
  dataInicioVigencia: Date
  /** `null` = ainda vigente (somente o Real). */
  dataFimVigencia: Date | null
  /** Quantas unidades desta moeda equivalem a 1 Real. */
  fatorParaReal: number
  baseLegal: string
  observacoes?: string
}

/** Resultado de converter um valor de uma moeda histórica para Real. */
export interface ConversaoMonetariaDetalhe {
  moeda: RegimeMonetario
  valorOriginal: number
  valorConvertido: number
}

/** Conversão dos dois lados da divisão da UFESP: o valor dos bens e a UFESP da época. */
export interface ConversaoMonetaria {
  valorBens: ConversaoMonetariaDetalhe
  ufespEpoca: ConversaoMonetariaDetalhe
}
