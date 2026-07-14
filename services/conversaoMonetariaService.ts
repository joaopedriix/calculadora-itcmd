import {
  MOEDA_AUTOMATICA,
  type CodigoMoeda,
  type ConversaoMonetariaDetalhe,
  type MoedaSelecionada,
  type RegimeMonetario,
} from "@/types"

/**
 * Histórico oficial dos padrões monetários brasileiros desde 1942,
 * verificado contra o Banco Central do Brasil (Reformas Monetárias) e
 * consistente com a nota de rodapé da própria página oficial da UFESP na
 * SEFAZ-SP ("de 16/01/89 a 15/03/90, CRUZADOS NOVOS; de 16/03/90 a 31/07/93,
 * CRUZEIROS; de 01/08/93 a 30/06/94, CRUZEIROS REAIS; após 30/06/94, REAIS").
 *
 * `fatorParaReal` é cumulativo (quantas unidades daquela moeda equivalem a
 * 1 Real de hoje) — nunca um fator "solto" inventado: cada um é o produto
 * dos fatores oficiais de cada transição, na cadeia até o Real.
 *
 * A moeda "Cruzeiro" existiu três vezes (1942–1967, 1970–1986, 1990–1993) —
 * cada instância tem um código e um fator próprios, nunca compartilhados,
 * porque os fatores diferem em ordens de grandeza entre elas.
 */
export const HISTORICO_MOEDAS: RegimeMonetario[] = [
  {
    codigo: "cruzeiro_1942",
    nome: "Cruzeiro",
    simbolo: "Cr$",
    dataInicioVigencia: new Date(1942, 0, 11),
    dataFimVigencia: new Date(1967, 1, 12),
    fatorParaReal: 2_750_000_000_000_000,
    baseLegal: "Decreto-Lei nº 4.791/1942; extinto pelo Decreto-Lei nº 1/1965 (Cruzeiro Novo, 13/02/1967)",
  },
  {
    codigo: "cruzeiro_novo",
    nome: "Cruzeiro Novo",
    simbolo: "NCr$",
    dataInicioVigencia: new Date(1967, 1, 13),
    dataFimVigencia: new Date(1970, 4, 14),
    fatorParaReal: 2_750_000_000_000,
    baseLegal: "Decreto-Lei nº 1/1965 (1 NCr$ = 1.000 Cr$)",
    observacoes: "Renomeado de volta para \"Cruzeiro\" em 15/05/1970, sem mudança de valor (1:1).",
  },
  {
    codigo: "cruzeiro_1970",
    nome: "Cruzeiro",
    simbolo: "Cr$",
    dataInicioVigencia: new Date(1970, 4, 15),
    dataFimVigencia: new Date(1986, 1, 27),
    fatorParaReal: 2_750_000_000_000,
    baseLegal: "Resolução do Banco Central nº 144/1970 (renomeação do Cruzeiro Novo, 1:1)",
  },
  {
    codigo: "cruzado",
    nome: "Cruzado",
    simbolo: "Cz$",
    dataInicioVigencia: new Date(1986, 1, 28),
    dataFimVigencia: new Date(1989, 0, 15),
    fatorParaReal: 2_750_000_000,
    baseLegal: "Decreto-Lei nº 2.283/1986 (Plano Cruzado; 1 Cz$ = 1.000 Cr$)",
  },
  {
    codigo: "cruzado_novo",
    nome: "Cruzado Novo",
    simbolo: "NCz$",
    dataInicioVigencia: new Date(1989, 0, 16),
    dataFimVigencia: new Date(1990, 2, 15),
    fatorParaReal: 2_750_000,
    baseLegal: "Medida Provisória nº 32/1989 (Plano Verão; 1 NCz$ = 1.000 Cz$)",
    observacoes: "Renomeado de volta para \"Cruzeiro\" em 16/03/1990, sem mudança de valor (1:1).",
  },
  {
    codigo: "cruzeiro_1990",
    nome: "Cruzeiro",
    simbolo: "Cr$",
    dataInicioVigencia: new Date(1990, 2, 16),
    dataFimVigencia: new Date(1993, 6, 31),
    fatorParaReal: 2_750_000,
    baseLegal: "Medida Provisória nº 168/1990 (Plano Collor; renomeação do Cruzado Novo, 1:1)",
  },
  {
    codigo: "cruzeiro_real",
    nome: "Cruzeiro Real",
    simbolo: "CR$",
    dataInicioVigencia: new Date(1993, 7, 1),
    dataFimVigencia: new Date(1994, 5, 30),
    fatorParaReal: 2750,
    baseLegal: "Medida Provisória nº 336/1993 (1 CR$ = 1.000 Cr$)",
  },
  {
    codigo: "real",
    nome: "Real",
    simbolo: "R$",
    dataInicioVigencia: new Date(1994, 6, 1),
    dataFimVigencia: null,
    fatorParaReal: 1,
    baseLegal:
      "Medida Provisória nº 542/1994 (Plano Real; paridade fixada em 1 Real = 2.750 Cruzeiros Reais, valor da URV em 30/06/1994)",
  },
]

/** Localiza o regime monetário vigente em uma data (nunca `null` dentro do intervalo coberto pela tabela, 1942–hoje). */
export function identificarMoeda(data: Date): RegimeMonetario {
  const encontrado = HISTORICO_MOEDAS.find(
    (regime) =>
      regime.dataInicioVigencia <= data &&
      (regime.dataFimVigencia === null || regime.dataFimVigencia >= data)
  )

  if (!encontrado) {
    throw new Error(
      `Nenhum padrão monetário conhecido cobre a data ${data.toLocaleDateString("pt-BR")}.`
    )
  }

  return encontrado
}

/** Busca um regime monetário pelo código (usado quando o usuário escolhe manualmente no Select). */
export function buscarRegimePorCodigo(codigo: CodigoMoeda): RegimeMonetario {
  const encontrado = HISTORICO_MOEDAS.find((regime) => regime.codigo === codigo)
  if (!encontrado) {
    throw new Error(`Código de moeda desconhecido: ${codigo}.`)
  }
  return encontrado
}

/**
 * Resolve a `MoedaSelecionada` do formulário (que pode ser `"auto"`) para um
 * regime monetário concreto: detecta pela data quando `"auto"`, ou usa o
 * código escolhido manualmente pelo advogado.
 */
export function resolverMoeda(selecao: MoedaSelecionada, dataReferencia: Date): RegimeMonetario {
  return selecao === MOEDA_AUTOMATICA ? identificarMoeda(dataReferencia) : buscarRegimePorCodigo(selecao)
}

/** Converte um valor expresso em `moeda` para Real. Nunca usa fator fixo — sempre o da tabela histórica oficial. */
export function converterParaReal(valor: number, moeda: RegimeMonetario): ConversaoMonetariaDetalhe {
  return {
    moeda,
    valorOriginal: valor,
    valorConvertido: valor / moeda.fatorParaReal,
  }
}

/**
 * Converte o valor de um registro de UFESP para Real, identificando a moeda
 * automaticamente pela própria data de vigência do registro — a moeda de um
 * registro de UFESP nunca é escolhida manualmente, é inerente à data.
 */
export function converterUFESP(valorUfesp: number, dataVigencia: Date): ConversaoMonetariaDetalhe {
  return converterParaReal(valorUfesp, identificarMoeda(dataVigencia))
}

/** Lista completa dos regimes monetários, mais antigo primeiro — usada para popular o Select "Moeda do Valor Informado". */
export function listarMoedasDisponiveis(): RegimeMonetario[] {
  return HISTORICO_MOEDAS
}
