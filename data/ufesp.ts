import type { UfespRecord } from "@/types"

/**
 * ============================================================================
 * TABELA HISTÓRICA DA UFESP — DADOS DE EXEMPLO (NÃO OFICIAIS)
 * ============================================================================
 *
 * Os valores abaixo são PLACEHOLDERS (progressão artificial de 0,01 por mês)
 * e servem apenas para permitir testar o fluxo completo da calculadora.
 *
 * Eles NÃO são os valores reais publicados pela SEFAZ-SP e NÃO devem ser
 * usados para gerar guias de ITCMD reais.
 *
 * ONDE ALIMENTAR A TABELA OFICIAL:
 * Substitua o array `UFESP_HISTORICO` abaixo pelos valores oficiais da
 * tabela histórica da UFESP (mês a mês), disponível na Portaria da SEFAZ-SP.
 * Cada registro segue o formato:
 *
 *   { ano: 1992, mes: 4, valor: 12.34 }
 *
 * onde `mes` é 1-indexado (1 = janeiro, 12 = dezembro) e `valor` é o valor
 * da UFESP em reais vigente naquele mês/ano.
 *
 * Nenhum outro arquivo deve importar este array diretamente — todo acesso
 * passa por `services/ufespService.ts`, o que permite substituir esta fonte
 * por um banco de dados ou API futuramente sem alterar o restante do app.
 */
export const UFESP_HISTORICO: UfespRecord[] = (() => {
  const registros: UfespRecord[] = []
  const anoInicial = 1989
  const anoFinal = new Date().getFullYear()
  let valor = 1

  for (let ano = anoInicial; ano <= anoFinal; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      registros.push({ ano, mes, valor: Number(valor.toFixed(2)) })
      valor += 0.01
    }
  }

  return registros
})()
