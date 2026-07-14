import { describe, expect, it } from "vitest"

import { buscarUFESP, buscarUFESPAtual } from "./ufespService"

describe("buscarUFESP — regressão contra dados oficiais da SEFAZ-SP", () => {
  it("encontra o valor oficial de 15/05/1991 (Cr$ 1.996,31)", () => {
    const registro = buscarUFESP(new Date(1991, 4, 15))
    expect(registro).not.toBeNull()
    expect(registro!.valor).toBeCloseTo(1996.31, 2)
  })

  it("armazena a moeda original do registro, nunca assumindo Real", () => {
    // 15/05/1991 está na era do "Cruzeiro" (1990-1993), nunca deve ser
    // tratado como se já estivesse em Real.
    const registro = buscarUFESP(new Date(1991, 4, 15))
    expect(registro!.moeda).toBe("cruzeiro_1990")

    // A UFESP vigente hoje deve ser identificada como Real.
    const atual = buscarUFESPAtual()
    expect(atual!.moeda).toBe("real")
  })

  it("aplica carry-forward em dia sem publicação (fim de semana em 1993)", () => {
    // 06/06/1993 é domingo — sem publicação; o valor vigente é o de 04/06/1993.
    const registro = buscarUFESP(new Date(1993, 5, 6))
    expect(registro).not.toBeNull()
    expect(registro!.valor).toBeCloseTo(228_588.32, 2)
  })

  it("nunca considera apenas ano/mês — datas vizinhas no mesmo mês podem ter valores diferentes", () => {
    const antes = buscarUFESP(new Date(1993, 5, 4))
    const depois = buscarUFESP(new Date(1993, 5, 7))
    expect(antes!.valor).not.toBe(depois!.valor)
  })

  it("retorna null para uma data sem UFESP cadastrada (antes de 1989)", () => {
    expect(buscarUFESP(new Date(1980, 0, 1))).toBeNull()
  })
})

describe("buscarUFESPAtual", () => {
  it("encontra um registro vigente para a data de hoje", () => {
    expect(buscarUFESPAtual()).not.toBeNull()
  })
})
