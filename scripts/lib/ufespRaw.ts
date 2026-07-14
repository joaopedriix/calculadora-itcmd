/**
 * Formato bruto compartilhado entre o scraper (extrai do DOM renderizado) e
 * o parser (interpreta e converte em registros de vigência). Mantido em
 * arquivo próprio para que o parser possa ser testado sem depender do
 * Playwright.
 */
export type RawUfespItem =
  | { kind: "heading"; text: string }
  | { kind: "table"; header: string[]; rows: string[][] }
