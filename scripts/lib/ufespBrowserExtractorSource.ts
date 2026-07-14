/**
 * Código-fonte (texto puro) executado dentro do navegador via
 * `page.evaluate(FONTE_EXTRATOR_UFESP)` em `ufespScraper.ts`.
 *
 * Guardado como STRING (não como função TypeScript) por dois motivos:
 *
 * 1. O `tsx`/esbuild injeta um helper `__name(...)` ao compilar
 *    funções/consts nomeadas (para preservar `.name`) — se este código fosse
 *    uma função normal e fosse serializada via `Function.prototype.toString()`
 *    para rodar no navegador, o helper não existiria lá, e quebraria com
 *    `ReferenceError: __name is not defined`.
 * 2. Ler isso de um arquivo `.js` à parte (via `fs.readFile`) não é
 *    confiável quando este módulo é empacotado pelo Next.js (a rota
 *    `app/api/ufesp/importar/route.ts` roda em um bundle cujo `__dirname`
 *    não aponta para o caminho real do arquivo no disco) — mantendo o
 *    código como uma constante de string, não há nenhuma leitura de arquivo
 *    em tempo de execução.
 */
export const FONTE_EXTRATOR_UFESP = `
;(() => {
  const MESES = [
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

  const todasTabelas = Array.from(document.querySelectorAll("table"))
  const tabelasDeDados = todasTabelas.filter((tabela) => {
    const texto = tabela.textContent || ""
    return texto.includes("PERÍODO") || texto.includes("VALOR EM")
  })

  if (tabelasDeDados.length === 0) {
    throw new Error(
      "Nenhuma tabela de UFESP encontrada na página oficial — o layout pode ter mudado."
    )
  }

  let container = tabelasDeDados[0].parentElement
  while (container && tabelasDeDados.some((tabela) => !container.contains(tabela))) {
    container = container.parentElement
  }
  if (!container) {
    throw new Error("Não foi possível localizar o container comum das tabelas de UFESP.")
  }

  // O rich text do SharePoint intercala caracteres invisíveis (zero-width
  // space, BOM etc.) no meio das palavras — sem removê-los, tanto as datas
  // quanto os números de comunicado ficam corrompidos.
  const CODIGO_ZERO_WIDTH_INICIO = 0x200b
  const CODIGO_ZERO_WIDTH_FIM = 0x200d
  const CODIGO_BOM = 0xfeff
  function limparTexto(texto) {
    return Array.from(texto)
      .filter((caractere) => {
        const codigo = caractere.codePointAt(0) || 0
        return (
          !(codigo >= CODIGO_ZERO_WIDTH_INICIO && codigo <= CODIGO_ZERO_WIDTH_FIM) &&
          codigo !== CODIGO_BOM
        )
      })
      .join("")
      .replace(/\\s+/g, " ")
      .trim()
  }

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT)
  const sequencia = []
  let node

  while ((node = walker.nextNode())) {
    const elemento = node

    if (elemento.tagName === "TABLE") {
      if (tabelasDeDados.indexOf(elemento) === -1) continue

      const linhas = Array.from(elemento.rows).map((linha) =>
        Array.from(linha.cells).map((celula) => limparTexto(celula.textContent || ""))
      )

      sequencia.push({
        kind: "table",
        header: linhas[0] || [],
        rows: linhas.slice(1),
      })
      continue
    }

    // Ignora qualquer nó que esteja dentro de uma tabela — evita confundir
    // células de dados (ex.: "JANEIRO" na tabela mensal de 1989) com títulos
    // de seção que ficam FORA das tabelas.
    if (elemento.children.length === 0 && !elemento.closest("table")) {
      const texto = limparTexto(elemento.textContent || "")
      const maiusculo = texto.toUpperCase()
      const ehTitulo =
        /^\\d{4}$/.test(texto) || MESES.indexOf(maiusculo) !== -1 || maiusculo.includes("ATÉ SETEMBRO")

      if (ehTitulo) {
        sequencia.push({ kind: "heading", text: texto })
      }
    }
  }

  return sequencia
})()
`
