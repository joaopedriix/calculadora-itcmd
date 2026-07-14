import { useMemo } from "react"

import { ALIQUOTA_ITCMD_PADRAO, PERCENTUAL_MULTA_PADRAO } from "@/constants/calculo"
import {
  calcularItcmd,
  calcularMulta,
  calcularQuantidadeUfesp,
  calcularValorAtualizado,
  calcularValorFinal,
} from "@/services/calculoService"
import { buscarUFESP, buscarUFESPAtual } from "@/services/ufespService"
import type { CalculoFormValues } from "@/lib/validations"

export interface ResumoProcessoPreview {
  numeroProcesso: string
  nomeCliente: string
  nomeFalecido: string
  dataFalecimento?: Date
  valorBens?: number
  ufespEncontrada: number | null
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
    aliquotaItcmd,
    percentualMulta,
  } = valores

  return useMemo(() => {
    const ufespAtual = buscarUFESPAtual()?.valor ?? null

    let ufespEncontrada: number | null = null
    let valorAtualizado: number | null = null
    let valorTotal: number | null = null

    if (dataFalecimento && valorBens && valorBens > 0 && ufespAtual !== null) {
      const registro = buscarUFESP(dataFalecimento)

      if (registro) {
        ufespEncontrada = registro.valor

        const quantidadeUfesp = calcularQuantidadeUfesp(valorBens, registro.valor)
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
      ufespEncontrada,
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
    aliquotaItcmd,
    percentualMulta,
  ])
}
