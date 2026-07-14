import { buscarRegimePorCodigo } from "@/services/conversaoMonetariaService"
import type { UfespRecord } from "@/types"
import { formatDate } from "@/utils/formatters"

/**
 * Geração de arquivos feita sem dependências externas (sem libs de
 * planilha) — os pacotes disponíveis para gerar `.xlsx` real (ex.: `xlsx` /
 * SheetJS) têm vulnerabilidades de alta severidade sem correção publicada.
 * Em vez disso, o "Excel" é gerado no formato SpreadsheetML (XML), que o
 * Excel e o LibreOffice abrem nativamente sem avisos de segurança.
 */

type LinhaExportacao = Record<string, string | number>

function paraLinhas(registros: UfespRecord[]): LinhaExportacao[] {
  return registros.map((registro) => ({
    "Data Inicial de Vigência": formatDate(registro.dataInicioVigencia),
    "Data Final de Vigência": registro.dataFimVigencia
      ? formatDate(registro.dataFimVigencia)
      : "",
    Ano: registro.ano,
    Mês: registro.mes,
    Dia: registro.dia,
    "Valor da UFESP": registro.valor,
    Moeda: buscarRegimePorCodigo(registro.moeda).moeda,
    "Base Legal": registro.baseLegal ?? "",
    Fonte: registro.fonte,
    Observações: registro.observacoes ?? "",
  }))
}

function baixarArquivo(conteudo: string, nomeArquivo: string, mimeType: string): void {
  const blob = new Blob([conteudo], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}

function escaparCsv(valor: string | number): string {
  const texto = String(valor)
  return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/** Exporta todos os registros informados como CSV (separado por `;`). */
export function exportarCSV(registros: UfespRecord[]): void {
  const linhas = paraLinhas(registros)
  const colunas = Object.keys(linhas[0] ?? {})

  const conteudo = [
    colunas.join(";"),
    ...linhas.map((linha) => colunas.map((coluna) => escaparCsv(linha[coluna])).join(";")),
  ].join("\r\n")

  // BOM no início para o Excel reconhecer UTF-8 corretamente.
  baixarArquivo("﻿" + conteudo, "tabela-ufesp.csv", "text/csv;charset=utf-8")
}

function escaparXml(valor: string | number): string {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** Exporta todos os registros informados como planilha Excel (SpreadsheetML). */
export function exportarExcel(registros: UfespRecord[]): void {
  const linhas = paraLinhas(registros)
  const colunas = Object.keys(linhas[0] ?? {})

  const celula = (valor: string | number) => {
    const tipo = typeof valor === "number" ? "Number" : "String"
    return `<Cell><Data ss:Type="${tipo}">${escaparXml(valor)}</Data></Cell>`
  }

  const linhaCabecalho = `<Row>${colunas.map((coluna) => celula(coluna)).join("")}</Row>`
  const linhasDados = linhas
    .map((linha) => `<Row>${colunas.map((coluna) => celula(linha[coluna])).join("")}</Row>`)
    .join("")

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="UFESP">
    <Table>
      ${linhaCabecalho}
      ${linhasDados}
    </Table>
  </Worksheet>
</Workbook>`

  baixarArquivo(xml, "tabela-ufesp.xls", "application/vnd.ms-excel")
}
