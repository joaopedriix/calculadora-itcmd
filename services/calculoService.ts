import { buscarUFESP, buscarUFESPAtual } from "@/services/ufespService"
import type { DadosCalculo, ResultadoCalculo } from "@/types"

/**
 * Erro de negócio lançado quando não existe UFESP cadastrada para o
 * mês/ano do falecimento informado. Permite à UI mostrar uma mensagem
 * amigável em vez de um erro genérico.
 */
export class UfespNaoEncontradaError extends Error {
  constructor(dataFalecimento: Date) {
    const mes = String(dataFalecimento.getMonth() + 1).padStart(2, "0")
    super(
      `Não há UFESP cadastrada para ${mes}/${dataFalecimento.getFullYear()}.`
    )
    this.name = "UfespNaoEncontradaError"
  }
}

/** Quantidade de UFESP = Valor dos Bens ÷ UFESP da época. */
export function calcularQuantidadeUfesp(
  valorBens: number,
  ufespEpoca: number
): number {
  return valorBens / ufespEpoca
}

/** Valor Atualizado = Quantidade UFESP × UFESP Atual. */
export function calcularValorAtualizado(
  quantidadeUfesp: number,
  ufespAtual: number
): number {
  return quantidadeUfesp * ufespAtual
}

/** ITCMD = Valor Atualizado × Alíquota (%). */
export function calcularItcmd(
  valorAtualizado: number,
  aliquotaItcmd: number
): number {
  return valorAtualizado * (aliquotaItcmd / 100)
}

/** Multa = ITCMD × Percentual da Multa (%). */
export function calcularMulta(
  valorItcmd: number,
  percentualMulta: number
): number {
  return valorItcmd * (percentualMulta / 100)
}

/** Valor Final = ITCMD + Multa. */
export function calcularValorFinal(valorItcmd: number, valorMulta: number): number {
  return valorItcmd + valorMulta
}

/**
 * Ponto único de entrada para executar um cálculo, despachando para a
 * estratégia correta a partir de `dados.tipoCalculo`.
 */
export function executarCalculo(dados: DadosCalculo): ResultadoCalculo {
  switch (dados.tipoCalculo) {
    case "atualizacao_ufesp":
      return calcularItcmdPorUfesp(dados)
    default:
      throw new Error(`Tipo de cálculo não suportado: ${dados.tipoCalculo}`)
  }
}

/**
 * Cálculo completo de ITCMD por atualização via UFESP.
 *
 * @throws {UfespNaoEncontradaError} quando não há UFESP para o período informado.
 */
function calcularItcmdPorUfesp(dados: DadosCalculo): ResultadoCalculo {
  const registroUfesp = buscarUFESP(dados.dataFalecimento)

  if (!registroUfesp) {
    throw new UfespNaoEncontradaError(dados.dataFalecimento)
  }

  const ufespEpoca = registroUfesp.valor
  const ufespAtual = buscarUFESPAtual()

  const quantidadeUfesp = calcularQuantidadeUfesp(dados.valorBens, ufespEpoca)
  const valorAtualizado = calcularValorAtualizado(quantidadeUfesp, ufespAtual)
  const valorItcmd = calcularItcmd(valorAtualizado, dados.aliquotaItcmd)
  const valorMulta = calcularMulta(valorItcmd, dados.percentualMulta)
  const valorTotal = calcularValorFinal(valorItcmd, valorMulta)

  return {
    ufespEpoca,
    ufespAtual,
    quantidadeUfesp,
    valorAtualizado,
    valorItcmd,
    valorMulta,
    valorTotal,
  }
}
