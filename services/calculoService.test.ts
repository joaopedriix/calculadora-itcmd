import { describe, expect, it } from "vitest"

import {
  calcularItcmd,
  calcularMulta,
  calcularQuantidadeUfesp,
  calcularValorAtualizado,
  calcularValorFinal,
  executarCalculo,
} from "./calculoService"
import { buscarUFESPAtual } from "./ufespService"

describe("funções puras de cálculo", () => {
  it("calcula a quantidade de UFESP pela divisão simples", () => {
    expect(calcularQuantidadeUfesp(19963.1, 1996.31)).toBeCloseTo(10, 6)
  })

  it("calcula o valor atualizado multiplicando pela UFESP atual", () => {
    expect(calcularValorAtualizado(10, 38.42)).toBeCloseTo(384.2, 6)
  })

  it("calcula o ITCMD aplicando a alíquota", () => {
    expect(calcularItcmd(384.2, 4)).toBeCloseTo(15.368, 6)
  })

  it("calcula a multa aplicando o percentual sobre o ITCMD", () => {
    expect(calcularMulta(15.368, 20)).toBeCloseTo(3.0736, 6)
  })

  it("soma ITCMD e multa no valor final", () => {
    expect(calcularValorFinal(15.368, 3.0736)).toBeCloseTo(18.4416, 6)
  })
})

describe("executarCalculo — regressão com dado oficial (15/05/1991)", () => {
  // Valor oficial da UFESP em 15/05/1991: Cr$ 1.996,31 (fonte: SEFAZ-SP).
  // Lançando o valor dos bens na MESMA moeda da época (Cruzeiro, detectado
  // automaticamente), a quantidade de UFESP deve dar exatamente 10 — igual
  // ao que o sistema já calculava antes da conversão monetária existir,
  // porque o fator de conversão se cancela quando os dois lados estão na
  // mesma moeda.
  const dadosBase = {
    dataFalecimento: new Date(1991, 4, 15),
    valorBens: 19_963.1, // Cr$ 19.963,10 = 10 × Cr$ 1.996,31
    moedaValorInformado: "auto" as const,
    aliquotaItcmd: 4,
    percentualMulta: 20,
    tipoCalculo: "atualizacao_ufesp" as const,
  }

  it("dá quantidade de UFESP = 10 com a moeda detectada automaticamente", () => {
    const resultado = executarCalculo(dadosBase)
    expect(resultado.quantidadeUfesp).toBeCloseTo(10, 6)
  })

  it("o valor atualizado é 10× a UFESP vigente hoje", () => {
    const resultado = executarCalculo(dadosBase)
    const ufespAtual = buscarUFESPAtual()!.valor
    expect(resultado.valorAtualizado).toBeCloseTo(10 * ufespAtual, 6)
  })

  it("expõe a conversão monetária auditável dos dois lados da divisão", () => {
    const resultado = executarCalculo(dadosBase)
    expect(resultado.conversaoMonetaria.valorBens.moeda.codigo).toBe("cruzeiro_1990")
    expect(resultado.conversaoMonetaria.ufespEpoca.moeda.codigo).toBe("cruzeiro_1990")
    // Mesma moeda dos dois lados => a divisão dá o mesmo resultado de sempre.
    expect(resultado.conversaoMonetaria.valorBens.valorConvertido).toBeCloseTo(
      dadosBase.valorBens / 2_750_000,
      10
    )
  })

  it("uma moeda divergente escolhida manualmente muda o resultado (e é isso que se espera)", () => {
    // Se o advogado disser que o valor já está em Real (em vez da moeda
    // real da época), o sistema não pode fingir que as moedas batem — o
    // resultado tem que refletir essa divergência declarada.
    const resultado = executarCalculo({ ...dadosBase, moedaValorInformado: "real" })
    expect(resultado.quantidadeUfesp).not.toBeCloseTo(10, 2)
    expect(resultado.quantidadeUfesp).toBeCloseTo(19_963.1 / (1996.31 / 2_750_000), 2)
  })
})
