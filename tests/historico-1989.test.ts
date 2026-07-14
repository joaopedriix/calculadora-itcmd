import { describe, expect, it } from "vitest"

import { executarCalculo } from "@/services/calculoService"
import { buscarUFESPAtual } from "@/services/ufespService"
import type { CodigoMoeda, MoedaSelecionada } from "@/types"

import casosOficiais from "./casos-oficiais.json"

/**
 * CASO OFICIAL DE VALIDAÇÃO — validado pelo escritório de advocacia
 * responsável pelos cálculos. Este é o teste de referência: nenhuma
 * alteração futura na lógica de cálculo pode quebrá-lo.
 *
 * Os dados completos do caso (entrada + valores esperados, incluindo o
 * registro de altíssima precisão fornecido pelo advogado e a nota sobre a
 * divergência de ponto flutuante) vivem em `casos-oficiais.json` — sempre
 * que um novo caso for validado, ele entra nesse arquivo, não neste teste.
 *
 * IMPORTANTE sobre precisão: os campos `valorBensConvertidoParaReal`,
 * `quantidadeUfesp` e `valorAtualizado` fornecidos pelo advogado (dentro de
 * `referenciaAdvogado`) divergem do valor computado aqui a partir da
 * 8ª–9ª casa decimal. Isso foi investigado e documentado (ver
 * `casos-oficiais.json`): é ruído de ponto flutuante do caminho de cálculo
 * da ferramenta de referência do escritório, não um erro no fator de
 * conversão oficial (Cruzado Novo → Real, verificado contra o Banco Central
 * do Brasil). O valor matematicamente exato de `quantidadeUfesp` é
 * 1487,96875 (fração exata 16189,10 ÷ 10,88); tanto o valor deste sistema
 * quanto o do advogado são variações desse valor dentro da margem de ruído
 * esperada para aritmética de ponto flutuante (double-precision). Os
 * valores finais em Real — ITCMD, Multa e Valor Total — são os que
 * efetivamente importam para a guia, e esses batem exatamente.
 */
const [caso] = casosOficiais.casos

describe(`Caso oficial — ${caso.descricao}`, () => {
  const dados = {
    dataFalecimento: new Date(`${caso.entrada.dataFalecimento}T00:00:00`),
    valorBens: caso.entrada.valorBens,
    moedaValorInformado: caso.entrada.moedaValorInformado as MoedaSelecionada,
    aliquotaItcmd: caso.entrada.aliquotaItcmd,
    percentualMulta: caso.entrada.percentualMulta,
    tipoCalculo: "atualizacao_ufesp" as const,
  }

  it("busca automaticamente a UFESP oficial da época (NCz$ 10,88 em 10/03/1989)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.ufespUtilizada.valor).toBeCloseTo(caso.esperado.ufespOriginal, 2)
    expect(resultado.ufespUtilizada.moeda).toBe(caso.esperado.moedaUfesp as CodigoMoeda)
  })

  it("identifica automaticamente a moeda vigente na data do falecimento (Cruzado Novo)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.conversaoMonetaria.valorBens.moeda.id).toBe(
      caso.esperado.moedaValorBens as CodigoMoeda
    )
  })

  it("converte o valor do bem para Real usando o fator oficial (÷ 2.750.000)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.conversaoMonetaria.valorBens.valorConvertido).toBeCloseTo(
      caso.esperado.referenciaAdvogado.valorBensConvertidoParaReal,
      6
    )
  })

  it("converte a UFESP da época para Real usando o fator oficial (÷ 2.750.000)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.conversaoMonetaria.ufespEpoca.valorConvertido).toBeCloseTo(
      caso.esperado.referenciaAdvogado.ufespConvertidaParaReal,
      6
    )
  })

  it("calcula a quantidade de UFESP (valor exato: 1.487,96875)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.quantidadeUfesp).toBeCloseTo(caso.esperado.quantidadeUfespExata, 6)
    // Também dentro da margem de ruído do valor de altíssima precisão do advogado.
    expect(resultado.quantidadeUfesp).toBeCloseTo(
      caso.esperado.referenciaAdvogado.quantidadeUfesp,
      6
    )
  })

  it("atualiza o patrimônio usando a UFESP vigente hoje (Quantidade × UFESP Atual)", () => {
    const resultado = executarCalculo(dados)
    const ufespAtualHoje = buscarUFESPAtual()!.valor
    expect(resultado.ufespAtual).toBeCloseTo(ufespAtualHoje, 6)
    expect(resultado.valorAtualizado).toBeCloseTo(resultado.quantidadeUfesp * ufespAtualHoje, 6)
  })

  it("calcula o ITCMD (Valor Atualizado × Alíquota)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.valorItcmd).toBeCloseTo(
      resultado.valorAtualizado * (dados.aliquotaItcmd / 100),
      6
    )
  })

  it("calcula a multa (ITCMD × Percentual de Multa)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.valorMulta).toBeCloseTo(resultado.valorItcmd * (dados.percentualMulta / 100), 6)
  })

  it("calcula o Valor Total da Guia (ITCMD + Multa)", () => {
    const resultado = executarCalculo(dados)
    expect(resultado.valorTotal).toBeCloseTo(resultado.valorItcmd + resultado.valorMulta, 6)
  })

  it("reproduz os valores finais em Real informados pelo advogado (ITCMD, Multa, Total), enquanto a UFESP atual for a mesma da validação", () => {
    const resultado = executarCalculo(dados)
    const ufespAtualHoje = buscarUFESPAtual()!.valor
    const { referenciaAdvogado } = caso.esperado

    if (ufespAtualHoje !== referenciaAdvogado.ufespAtualNaValidacao) {
      // A UFESP atual mudou desde a validação original (esperado — a tabela
      // é atualizada todo ano) — os centavos finais também mudam
      // legitimamente, então não faz sentido comparar com os valores
      // congelados. A cobertura da fórmula já foi feita nos testes acima.
      return
    }

    expect(resultado.valorItcmd).toBeCloseTo(referenciaAdvogado.valorItcmd, 2)
    expect(resultado.valorMulta).toBeCloseTo(referenciaAdvogado.valorMulta, 2)
    expect(resultado.valorTotal).toBeCloseTo(referenciaAdvogado.valorTotal, 2)
  })
})
