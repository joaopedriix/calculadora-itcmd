import type { UfespRecord } from "@/types"

/**
 * ============================================================================
 * TABELA HISTÓRICA DA UFESP — DADOS DE EXEMPLO (NÃO OFICIAIS)
 * ============================================================================
 *
 * Os valores abaixo são PLACEHOLDERS (uma progressão artificial de R$ 0,01
 * por mês) e servem apenas como carga inicial para testar o módulo
 * administrativo e o fluxo completo da calculadora.
 *
 * Eles NÃO são os valores reais publicados pela SEFAZ-SP e NÃO devem ser
 * usados para gerar guias de ITCMD reais.
 *
 * ONDE ALIMENTAR A TABELA OFICIAL:
 * Esta constante é usada apenas como carga inicial (seed) do módulo
 * administrativo — a partir do primeiro carregamento, os registros passam a
 * ser gerenciados em memória por `services/ufespService.ts` através da tela
 * "Tabela Histórica UFESP" (criar, editar, excluir). Para popular o sistema
 * com a tabela oficial, use a própria tela administrativa (ou, futuramente,
 * o botão "Importar Base" once implementado).
 *
 * Cada registro representa um período de vigência — não apenas um mês —
 * porque historicamente a UFESP já teve reajustes mensais e até diários.
 * A busca correta considera sempre o intervalo de vigência, nunca apenas
 * ano/mês (ver `buscarUFESP` em `services/ufespService.ts`).
 */
function gerarSeedUfesp(): UfespRecord[] {
  const registros: UfespRecord[] = []
  const anoInicial = 1989
  const hoje = new Date()
  const anoFinal = hoje.getFullYear()
  const mesFinal = hoje.getMonth() + 1

  let valor = 1
  const agora = new Date()

  anoLoop: for (let ano = anoInicial; ano <= anoFinal; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      if (ano === anoFinal && mes > mesFinal) break anoLoop

      const dataInicioVigencia = new Date(ano, mes - 1, 1)
      const ehMesAtual = ano === anoFinal && mes === mesFinal
      const dataFimVigencia = ehMesAtual ? null : new Date(ano, mes, 0)

      registros.push({
        id: `seed-${ano}-${String(mes).padStart(2, "0")}`,
        dataInicioVigencia,
        dataFimVigencia,
        ano,
        mes,
        dia: 1,
        valor: Number(valor.toFixed(2)),
        fonte: "Exemplo (placeholder)",
        observacoes:
          "Dado de exemplo — substitua pela tabela oficial da SEFAZ-SP.",
        createdAt: agora,
        updatedAt: agora,
      })

      valor += 0.01
    }
  }

  return registros
}

export const UFESP_SEED: UfespRecord[] = gerarSeedUfesp()
