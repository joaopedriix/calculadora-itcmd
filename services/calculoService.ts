import { converterParaReal, converterUFESP, resolverMoeda } from "@/services/conversaoMonetariaService"
import { buscarUFESP, buscarUFESPAtual } from "@/services/ufespService"
import type { DadosCalculo, ResultadoCalculo } from "@/types"

/**
 * Erro de negócio lançado quando não existe UFESP cadastrada para o
 * mês/ano do falecimento informado. Permite à UI mostrar uma mensagem
 * amigável em vez de um erro genérico.
 */
export class UfespNaoEncontradaError extends Error {
  constructor(dataFalecimento: Date) {
    const dia = String(dataFalecimento.getDate()).padStart(2, "0")
    const mes = String(dataFalecimento.getMonth() + 1).padStart(2, "0")
    super(
      `Não há UFESP cadastrada vigente em ${dia}/${mes}/${dataFalecimento.getFullYear()}.`
    )
    this.name = "UfespNaoEncontradaError"
  }
}

/**
 * Quantidade de UFESP = Valor dos Bens ÷ UFESP da época.
 *
 * Os dois valores devem estar na MESMA moeda (normalmente já convertidos
 * para Real por `converterParaReal`/`converterUFESP` antes de chegar aqui —
 * ver `calcularItcmdPorUfesp`). Dividir valores em moedas diferentes sem
 * conversão prévia produz um resultado sem sentido.
 */
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
 * @throws {UfespNaoEncontradaError} quando não há UFESP vigente na data do falecimento.
 * @throws {Error} quando não há nenhuma UFESP vigente hoje (tabela mal cadastrada).
 */
function calcularItcmdPorUfesp(dados: DadosCalculo): ResultadoCalculo {
  const registroEpoca = buscarUFESP(dados.dataFalecimento)

  if (!registroEpoca) {
    throw new UfespNaoEncontradaError(dados.dataFalecimento)
  }

  const registroAtual = buscarUFESPAtual()

  if (!registroAtual) {
    throw new Error(
      "Não há UFESP vigente cadastrada para a data de hoje. Cadastre um registro atual na Tabela Histórica UFESP."
    )
  }

  const ufespAtual = registroAtual.valor

  // Antes de dividir, os dois lados precisam estar na mesma moeda (Real):
  // a moeda do valor dos bens é a escolhida/detectada pelo advogado; a
  // moeda da UFESP da época é sempre a vigente na própria data do registro
  // (nunca escolhida manualmente — é inerente à tabela oficial).
  const moedaValorBens = resolverMoeda(dados.moedaValorInformado, dados.dataFalecimento)
  const conversaoValorBens = converterParaReal(dados.valorBens, moedaValorBens)
  const conversaoUfespEpoca = converterUFESP(registroEpoca.valor, registroEpoca.dataInicioVigencia)

  const quantidadeUfesp = calcularQuantidadeUfesp(
    conversaoValorBens.valorConvertido,
    conversaoUfespEpoca.valorConvertido
  )
  const valorAtualizado = calcularValorAtualizado(quantidadeUfesp, ufespAtual)
  const valorItcmd = calcularItcmd(valorAtualizado, dados.aliquotaItcmd)
  const valorMulta = calcularMulta(valorItcmd, dados.percentualMulta)
  const valorTotal = calcularValorFinal(valorItcmd, valorMulta)

  return {
    ufespUtilizada: {
      valor: registroEpoca.valor,
      dataInicioVigencia: registroEpoca.dataInicioVigencia,
      dataFimVigencia: registroEpoca.dataFimVigencia,
      baseLegal: registroEpoca.baseLegal,
      fonte: registroEpoca.fonte,
      observacoes: registroEpoca.observacoes,
    },
    conversaoMonetaria: {
      valorBens: conversaoValorBens,
      ufespEpoca: conversaoUfespEpoca,
    },
    ufespAtual,
    quantidadeUfesp,
    valorAtualizado,
    valorItcmd,
    valorMulta,
    valorTotal,
  }
}
