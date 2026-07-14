import { describe, expect, it } from "vitest"

import {
  buscarRegimePorCodigo,
  converterUFESPParaReal,
  converterValorParaReal,
  identificarMoeda,
  resolverMoeda,
} from "./conversaoMonetariaService"

describe("identificarMoeda", () => {
  it("identifica o Real para datas a partir de 01/07/1994", () => {
    expect(identificarMoeda(new Date(1994, 6, 1)).id).toBe("real")
    expect(identificarMoeda(new Date(2026, 0, 1)).id).toBe("real")
  })

  it("identifica o Cruzeiro Real entre 01/08/1993 e 30/06/1994", () => {
    expect(identificarMoeda(new Date(1993, 7, 1)).id).toBe("cruzeiro_real")
    expect(identificarMoeda(new Date(1994, 2, 1)).id).toBe("cruzeiro_real")
    expect(identificarMoeda(new Date(1994, 5, 30)).id).toBe("cruzeiro_real")
  })

  it("identifica o Cruzeiro (1990-1993) entre 16/03/1990 e 31/07/1993", () => {
    expect(identificarMoeda(new Date(1990, 2, 16)).id).toBe("cruzeiro_1990")
    expect(identificarMoeda(new Date(1991, 4, 15)).id).toBe("cruzeiro_1990")
    expect(identificarMoeda(new Date(1993, 6, 31)).id).toBe("cruzeiro_1990")
  })

  it("identifica o Cruzado Novo entre 16/01/1989 e 15/03/1990", () => {
    expect(identificarMoeda(new Date(1989, 0, 16)).id).toBe("cruzado_novo")
    expect(identificarMoeda(new Date(1990, 2, 15)).id).toBe("cruzado_novo")
  })

  it("nunca deixa um dia sem moeda entre eras consecutivas", () => {
    // 15/03/1990 (Cruzado Novo) e 16/03/1990 (Cruzeiro) são dias consecutivos
    expect(identificarMoeda(new Date(1990, 2, 15)).id).toBe("cruzado_novo")
    expect(identificarMoeda(new Date(1990, 2, 16)).id).toBe("cruzeiro_1990")
  })
})

describe("converterValorParaReal", () => {
  it("converte Cruzeiro Real para Real dividindo por 2.750", () => {
    const regime = buscarRegimePorCodigo("cruzeiro_real")
    const resultado = converterValorParaReal(2750, regime)
    expect(resultado.valorConvertido).toBeCloseTo(1, 10)
  })

  it("converte Cruzeiro (1990-1993) para Real dividindo por 2.750.000", () => {
    const regime = buscarRegimePorCodigo("cruzeiro_1990")
    const resultado = converterValorParaReal(2_750_000, regime)
    expect(resultado.valorConvertido).toBeCloseTo(1, 10)
  })

  it("não altera valores já em Real (fator 1)", () => {
    const regime = buscarRegimePorCodigo("real")
    const resultado = converterValorParaReal(1234.56, regime)
    expect(resultado.valorConvertido).toBe(1234.56)
  })
})

describe("converterUFESPParaReal", () => {
  it("identifica a moeda do próprio registro pela data de vigência", () => {
    // UFESP de 15/05/1991 = Cr$ 1.996,31 (valor oficial, mesma moeda do Cruzeiro 1990-1993)
    const resultado = converterUFESPParaReal(1996.31, new Date(1991, 4, 15))
    expect(resultado.moeda.id).toBe("cruzeiro_1990")
    expect(resultado.valorConvertido).toBeCloseTo(1996.31 / 2_750_000, 10)
  })
})

describe("resolverMoeda", () => {
  it('com "auto", detecta pela data de referência', () => {
    const regime = resolverMoeda("auto", new Date(1991, 4, 15))
    expect(regime.id).toBe("cruzeiro_1990")
  })

  it("com um código explícito, ignora a data e usa o código escolhido", () => {
    const regime = resolverMoeda("cruzeiro_real", new Date(1991, 4, 15))
    expect(regime.id).toBe("cruzeiro_real")
  })
})
