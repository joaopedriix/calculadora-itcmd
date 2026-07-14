import { useMemo } from "react"

import { ALIQUOTA_ITCMD_PADRAO, PERCENTUAL_MULTA_PADRAO } from "@/constants/calculo"
import {
  calcularItcmd,
  calcularMulta,
  calcularQuantidadeUfesp,
  calcularValorAtualizado,
  calcularValorFinal,
} from "@/services/calculoService"
import { converterValorParaReal, converterUFESPParaReal, resolverMoeda } from "@/services/conversaoMonetariaService"
import { buscarUFESP, buscarUFESPAtual } from "@/services/ufespService"
import type { CalculoFormValues } from "@/lib/validations"
import { MOEDA_AUTOMATICA, type CodigoMoeda } from "@/types"

export interface ResumoProcessoPreview {
  numeroProcesso: string
  nomeCliente: string
  nomeFalecido: string
  dataFalecimento?: Date
  valorBens?: number
  /** Moeda em que `valorBens` foi informado (detectada ou escolhida manualmente). */
  valorBensMoeda: CodigoMoeda | null
  ufespEncontrada: number | null
  /** Moeda original da UFESP encontrada — nunca assumir Real (ver `ufespEncontrada`). */
  ufespMoeda: CodigoMoeda | null
  ufespAtual: number | null
  valorAtualizado: number | null
  valorTotal: number | null
}

/**
 * Deriva, em tempo real e sem lançar erros, uma prévia do cálculo a partir
 * dos valores atuais do formulário — usada pelo painel lateral "Resumo do
 * Processo" enquanto o advogado ainda está preenchendo os campos.
 */
export function useResumoProcesso(
  valores: Partial<CalculoFormValues>
): ResumoProcessoPreview {
  const {
    numeroProcesso,
    nomeCliente,
    nomeFalecido,
    dataFalecimento,
    valorBens,
    moedaValorInformado,
    aliquotaItcmd,
    percentualMulta,
  } = valores

  return useMemo(() => {
    const ufespAtual = buscarUFESPAtual()?.valor ?? null

    let ufespEncontrada: number | null = null
    let ufespMoeda: CodigoMoeda | null = null
    let valorBensMoeda: CodigoMoeda | null = null
    let valorAtualizado: number | null = null
    let valorTotal: number | null = null

    if (dataFalecimento) {
      valorBensMoeda = resolverMoeda(moedaValorInformado ?? MOEDA_AUTOMATICA, dataFalecimento).id
    }

    if (dataFalecimento && valorBens && valorBens > 0 && ufespAtual !== null) {
      const registro = buscarUFESP(dataFalecimento)

      if (registro) {
        ufespEncontrada = registro.valor
        ufespMoeda = registro.moeda

        const moedaValorBens = resolverMoeda(
          moedaValorInformado ?? MOEDA_AUTOMATICA,
          dataFalecimento
        )
        const conversaoValorBens = converterValorParaReal(valorBens, moedaValorBens)
        const conversaoUfespEpoca = converterUFESPParaReal(registro.valor, registro.dataInicioVigencia)

        const quantidadeUfesp = calcularQuantidadeUfesp(
          conversaoValorBens.valorConvertido,
          conversaoUfespEpoca.valorConvertido
        )
        valorAtualizado = calcularValorAtualizado(quantidadeUfesp, ufespAtual)

        const valorItcmd = calcularItcmd(
          valorAtualizado,
          aliquotaItcmd ?? ALIQUOTA_ITCMD_PADRAO
        )
        const valorMulta = calcularMulta(
          valorItcmd,
          percentualMulta ?? PERCENTUAL_MULTA_PADRAO
        )
        valorTotal = calcularValorFinal(valorItcmd, valorMulta)
      }
    }

    return {
      numeroProcesso: numeroProcesso ?? "",
      nomeCliente: nomeCliente ?? "",
      nomeFalecido: nomeFalecido ?? "",
      dataFalecimento,
      valorBens,
      valorBensMoeda,
      ufespEncontrada,
      ufespMoeda,
      ufespAtual,
      valorAtualizado,
      valorTotal,
    }
  }, [
    numeroProcesso,
    nomeCliente,
    nomeFalecido,
    dataFalecimento,
    valorBens,
    moedaValorInformado,
    aliquotaItcmd,
    percentualMulta,
  ])
}
