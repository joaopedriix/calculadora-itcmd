import { UFESP_HISTORICO } from "@/data/ufesp"
import { UFESP_ATUAL } from "@/constants/ufespAtual"
import type { UfespRecord } from "@/types"

/**
 * Único ponto de acesso à tabela histórica e ao valor atual da UFESP.
 * Nenhum componente ou serviço deve importar `data/ufesp.ts` ou
 * `constants/ufespAtual.ts` diretamente — isso mantém a origem dos dados
 * (arquivo local, banco de dados ou API) como um detalhe de implementação
 * substituível sem impacto no restante do app.
 */

/**
 * Busca o registro de UFESP correspondente ao mês/ano de uma data.
 * Retorna `null` quando não há UFESP cadastrada para o período.
 */
export function buscarUFESP(data: Date): UfespRecord | null {
  const ano = data.getFullYear()
  const mes = data.getMonth() + 1

  const registro = UFESP_HISTORICO.find(
    (item) => item.ano === ano && item.mes === mes
  )

  return registro ?? null
}

/**
 * Retorna o valor da UFESP vigente no momento atual.
 */
export function buscarUFESPAtual(): number {
  return UFESP_ATUAL.valor
}

/**
 * Lista completa da tabela histórica, ordenada cronologicamente.
 * Útil para telas administrativas futuras (conferência/versionamento).
 */
export function listarUFESP(): UfespRecord[] {
  return [...UFESP_HISTORICO].sort((a, b) =>
    a.ano === b.ano ? a.mes - b.mes : a.ano - b.ano
  )
}
