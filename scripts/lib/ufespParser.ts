import type { RawUfespItem } from "./ufespRaw"

const FONTE = "Secretaria da Fazenda do Estado de São Paulo"

const MESES_NOMES = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
]

/** Registro de vigência já pronto para gravação (datas em ISO `yyyy-MM-dd`). */
export interface UfespRecordInput {
  id: string
  dataInicioVigencia: string
  dataFimVigencia: string
  valor: number
  baseLegal?: string
  fonte: string
  observacoes?: string
  createdAt: string
  updatedAt: string
}

type TipoTabela = "anual" | "periodoExplicito" | "diaria" | "mensalSemDia"

/** Evento de publicação (granularidade diária ou mensal) antes da mesclagem. */
interface EventoPublicacao {
  data: Date
  valor: number
  moeda: string
  observacaoExtra?: string
  /** `true` para registros que nunca devem ser mesclados com vizinhos (ex.: nota de rodapé). */
  isolado: boolean
}

/** Vigência já delimitada (tabelas anual/semestral/trimestral) ou resultante da mesclagem. */
interface RegistroPreliminar {
  dataInicioVigencia: Date
  dataFimVigencia: Date
  /** `true` quando a data final já veio pronta da fonte e não deve ser recalculada. */
  fimEhFinal: boolean
  valor: number
  moeda: string
  baseLegal?: string
  observacaoExtra?: string
}

function diaAnterior(data: Date): Date {
  const resultado = new Date(data)
  resultado.setDate(resultado.getDate() - 1)
  return resultado
}

function paraIso(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}

/**
 * Extrai o valor numérico (formato pt-BR, vírgula decimal) de uma célula.
 * Devolve `null` para células vazias ou "-" (dia sem publicação — o valor
 * vigente é o último publicado, tratado por carry-forward em outro lugar).
 * Um "*" na célula sinaliza uma nota de rodapé da fonte (ex.: necessidade de
 * correção adicional) — nunca descartada, sempre preservada em observações.
 */
function parseValorComNota(bruto: string): { valor: number | null; nota?: string } {
  const texto = bruto.trim()
  if (texto === "" || texto === "-") return { valor: null }

  const temNota = texto.includes("*")
  const numerico = texto
    .replace(/\*/g, "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
  const valor = Number(numerico)

  if (!Number.isFinite(valor)) {
    throw new Error(`Valor de UFESP não numérico: "${bruto}"`)
  }

  return {
    valor,
    nota: temNota
      ? "Valor sinalizado pela fonte oficial com nota de rodapé (ex.: necessidade de correção adicional, como pelo IPC do mês) — confira o texto integral na página oficial antes de utilizar este registro."
      : undefined,
  }
}

function moedaDoHeader(header: string[]): string {
  const coluna = header.find((celula) => celula.toUpperCase().includes("VALOR EM"))
  if (!coluna) return "R$"
  return coluna.replace(/^.*VALOR EM\s*/i, "").trim() || "R$"
}

function nomeDaMoeda(sigla: string): string {
  switch (sigla) {
    case "NCZ$":
      return "Cruzados Novos"
    case "Cr$":
      return "Cruzeiros"
    case "CR$":
      return "Cruzeiros Reais"
    case "R$":
      return "Reais"
    default:
      return sigla
  }
}

function montarObservacoes(moeda: string, extra?: string): string | undefined {
  const partes: string[] = []
  if (moeda !== "R$") {
    partes.push(
      `Valor expresso em ${nomeDaMoeda(moeda)} (${moeda}), a moeda oficial vigente nesta data — não convertido para Real.`
    )
  }
  if (extra) partes.push(extra)
  return partes.length > 0 ? partes.join(" ") : undefined
}

function classificarTabela(tabela: { header: string[]; rows: string[][] }): TipoTabela {
  if (tabela.header.length >= 3 || tabela.header.some((h) => h.toUpperCase().includes("BASE LEGAL"))) {
    return "anual"
  }

  const primeiraCelula = tabela.rows[0]?.[0]?.trim() ?? ""
  if (/^de\s+\d{2}\/\d{2}\/\d{2,4}\s+a\s+/i.test(primeiraCelula)) return "periodoExplicito"
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(primeiraCelula)) return "diaria"
  if (MESES_NOMES.includes(primeiraCelula.toUpperCase())) return "mensalSemDia"

  throw new Error(
    `Não foi possível classificar a tabela de UFESP com cabeçalho ${JSON.stringify(tabela.header)}`
  )
}

/**
 * Converte a sequência bruta extraída do DOM em registros de vigência
 * cronológicos, tratando as quatro granularidades publicadas pela fonte
 * (anual, semestral/trimestral, diária, mensal) de forma unificada.
 *
 * Nunca simplifica: cada mudança real de valor vira um registro; dias sem
 * publicação (fins de semana/feriados) apenas carregam adiante o último
 * valor publicado, nunca criam um valor novo nem um buraco na vigência.
 */
export function parseSequenciaUfesp(sequencia: RawUfespItem[]): UfespRecordInput[] {
  const intervalosFixos: RegistroPreliminar[] = []
  const eventos: EventoPublicacao[] = []

  let anoAtual: number | null = null
  let mesAtual: number | null = null
  let ultimoAnoProcessado = Infinity

  sequenciaLoop: for (const item of sequencia) {
    if (item.kind === "heading") {
      const texto = item.text.trim()

      if (/^\d{4}$/.test(texto)) {
        const ano = Number(texto)
        // A página repete um bloco antigo/incompleto após concluir 1989 —
        // paramos assim que a sequência de anos deixa de ser estritamente
        // decrescente, em vez de tentar deduplicar por conteúdo.
        if (ano >= ultimoAnoProcessado) break sequenciaLoop
        anoAtual = ano
        ultimoAnoProcessado = ano
        mesAtual = null
        continue
      }

      const indiceMes = MESES_NOMES.indexOf(texto.toUpperCase())
      if (indiceMes >= 0) {
        mesAtual = indiceMes + 1
        continue
      }

      continue
    }

    const tipo = classificarTabela(item)
    const moeda = moedaDoHeader(item.header)

    if (tipo === "anual") {
      for (const linha of item.rows) {
        if (linha.length < 2 || !linha[0]?.trim()) continue // linha de espaçamento/nota
        const [periodo, valorTxt, baseLegalTxt] = linha
        const match = periodo.match(
          /de\s+(\d{2})\/(\d{2})\/(\d{4})\s+[Aa]\s+(\d{2})\/(\d{2})\/(\d{4})/
        )
        if (!match) throw new Error(`Período anual não reconhecido: "${periodo}"`)
        const [, d1, m1, y1, d2, m2, y2] = match
        const ano = Number(y1)
        // Mesma proteção contra o bloco antigo/duplicado descrito acima:
        // aqui os anos embutidos na própria linha (não em um título) também
        // não podem retroceder. Usa ">" (não ">=") porque um título de ano
        // (ex.: "1996") já deixou esse mesmo ano em `ultimoAnoProcessado`
        // antes da tabela correspondente ser processada.
        if (ano > ultimoAnoProcessado) break sequenciaLoop
        ultimoAnoProcessado = ano

        const { valor } = parseValorComNota(valorTxt)
        if (valor === null) continue

        intervalosFixos.push({
          dataInicioVigencia: new Date(Number(y1), Number(m1) - 1, Number(d1)),
          dataFimVigencia: new Date(Number(y2), Number(m2) - 1, Number(d2)),
          fimEhFinal: true,
          valor,
          moeda,
          baseLegal: baseLegalTxt?.trim() || undefined,
        })
      }
      continue
    }

    if (tipo === "periodoExplicito") {
      for (const linha of item.rows) {
        if (linha.length < 2 || !linha[0]?.trim()) continue // linha de espaçamento/nota
        const [periodo, valorTxt] = linha
        const match = periodo.match(
          /de\s+(\d{2})\/(\d{2})\/(\d{2})\s+a\s+(\d{2})\/(\d{2})\/(\d{2})/i
        )
        if (!match) throw new Error(`Período semestral/trimestral não reconhecido: "${periodo}"`)
        const [, d1, m1, y1, d2, m2, y2] = match
        const ano = 1900 + Number(y1)
        if (ano > ultimoAnoProcessado) break sequenciaLoop
        ultimoAnoProcessado = ano

        const { valor } = parseValorComNota(valorTxt)
        if (valor === null) continue

        intervalosFixos.push({
          dataInicioVigencia: new Date(1900 + Number(y1), Number(m1) - 1, Number(d1)),
          dataFimVigencia: new Date(1900 + Number(y2), Number(m2) - 1, Number(d2)),
          fimEhFinal: true,
          valor,
          moeda,
        })
      }
      continue
    }

    if (tipo === "mensalSemDia") {
      if (anoAtual === null) {
        throw new Error("Tabela mensal (jan-set/1989) encontrada sem ano de referência.")
      }
      for (const linha of item.rows) {
        if (linha.length < 2) continue // linha de espaçamento ou nota de rodapé (célula única)
        const [mesTxt, valorTxt] = linha
        if (!mesTxt?.trim()) continue // linha em branco (espaçamento) — sem dado a extrair

        const indiceMes = MESES_NOMES.indexOf(mesTxt.toUpperCase())
        if (indiceMes < 0) {
          throw new Error(`Mês não reconhecido na tabela mensal de ${anoAtual}: "${mesTxt}"`)
        }
        const { valor, nota } = parseValorComNota(valorTxt)
        if (valor === null) continue

        eventos.push({
          data: new Date(anoAtual, indiceMes, 1),
          valor,
          moeda,
          observacaoExtra: nota,
          isolado: !!nota,
        })
      }
      continue
    }

    // tipo === "diaria"
    if (anoAtual === null) {
      throw new Error("Tabela diária encontrada sem ano de referência.")
    }
    for (const linha of item.rows) {
      if (linha.length < 2 || !linha[0]?.trim()) continue // linha de espaçamento/nota
      const [diaTxt, valorTxt] = linha
      // A barra entre mês e ano ocasionalmente falta na fonte oficial (ex.:
      // "26/0290" em vez de "26/02/90") — tolerado aqui para não abortar a
      // importação por um typo de digitação da própria SEFAZ-SP.
      const match = diaTxt.match(/^(\d{2})\/(\d{2})\/?(\d{2})$/)
      if (!match) throw new Error(`Data diária não reconhecida: "${diaTxt}"`)
      const [, dd, mm, yy] = match
      const mesDaLinha = Number(mm)

      const { valor, nota } = parseValorComNota(valorTxt)
      if (valor === null) continue // "-": sem publicação, mantém o valor anterior (carry-forward)

      // A checagem de mês só faz sentido para linhas com valor publicado —
      // a própria fonte oficial já contém pelo menos um erro de digitação
      // (ex.: "06/05/93" em vez de "06/06/93") numa linha sem valor ("-"),
      // que não deve interromper a importação.
      if (mesAtual !== null && mesDaLinha !== mesAtual) {
        throw new Error(
          `Data diária "${diaTxt}" não corresponde ao mês esperado (${mesAtual}/${anoAtual}) — possível erro de classificação.`
        )
      }

      eventos.push({
        data: new Date(1900 + Number(yy), mesDaLinha - 1, Number(dd)),
        valor,
        moeda,
        observacaoExtra: nota,
        isolado: !!nota,
      })
    }
  }

  if (intervalosFixos.length === 0 && eventos.length === 0) {
    throw new Error("Nenhum registro de UFESP foi extraído da página oficial.")
  }

  // Mescla eventos consecutivos com o mesmo valor/moeda em um único
  // intervalo de vigência — isso NÃO perde granularidade (o valor realmente
  // não mudou nesse intervalo), é exatamente como a própria fonte já
  // representa os anos recentes (uma linha por ano inteiro).
  eventos.sort((a, b) => a.data.getTime() - b.data.getTime())
  const registrosMesclados: RegistroPreliminar[] = []

  for (const evento of eventos) {
    const anterior = registrosMesclados.at(-1)
    const podeEstender =
      anterior &&
      !anterior.observacaoExtra &&
      !evento.isolado &&
      anterior.valor === evento.valor &&
      anterior.moeda === evento.moeda

    if (podeEstender) continue

    registrosMesclados.push({
      dataInicioVigencia: evento.data,
      dataFimVigencia: evento.data, // provisório — recalculado abaixo
      fimEhFinal: false,
      valor: evento.valor,
      moeda: evento.moeda,
      observacaoExtra: evento.observacaoExtra,
    })
  }

  const todos = [...intervalosFixos, ...registrosMesclados].sort(
    (a, b) => a.dataInicioVigencia.getTime() - b.dataInicioVigencia.getTime()
  )

  for (let i = 0; i < todos.length; i++) {
    if (todos[i].fimEhFinal) continue
    todos[i].dataFimVigencia =
      i + 1 < todos.length ? diaAnterior(todos[i + 1].dataInicioVigencia) : new Date()
  }

  validarCronologia(todos)

  const agora = new Date().toISOString()
  return todos.map((registro, indice) => ({
    id: `sefaz-${paraIso(registro.dataInicioVigencia)}-${indice}`,
    dataInicioVigencia: paraIso(registro.dataInicioVigencia),
    dataFimVigencia: paraIso(registro.dataFimVigencia),
    valor: registro.valor,
    baseLegal: registro.baseLegal,
    fonte: FONTE,
    observacoes: montarObservacoes(registro.moeda, registro.observacaoExtra),
    createdAt: agora,
    updatedAt: agora,
  }))
}

/**
 * Validações de sanidade: nunca aceitar uma base com sobreposições, buracos
 * ou valores inválidos — melhor abortar a importação do que gravar dados
 * incorretos (ver `scripts/importar-ufesp.ts`, que preserva a base anterior
 * em caso de erro).
 */
function validarCronologia(registros: RegistroPreliminar[]): void {
  for (const registro of registros) {
    if (!(registro.valor > 0)) {
      throw new Error(
        `Valor de UFESP inválido (${registro.valor}) para o período iniciado em ${paraIso(
          registro.dataInicioVigencia
        )}.`
      )
    }
    if (registro.dataFimVigencia < registro.dataInicioVigencia) {
      throw new Error(
        `Período de vigência inválido: fim (${paraIso(
          registro.dataFimVigencia
        )}) anterior ao início (${paraIso(registro.dataInicioVigencia)}).`
      )
    }
  }

  for (let i = 1; i < registros.length; i++) {
    const anterior = registros[i - 1]
    const atual = registros[i]
    if (atual.dataInicioVigencia <= anterior.dataFimVigencia) {
      throw new Error(
        `Sobreposição de vigência detectada entre os períodos iniciados em ${paraIso(
          anterior.dataInicioVigencia
        )} e ${paraIso(atual.dataInicioVigencia)}.`
      )
    }
  }
}
