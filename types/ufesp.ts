/**
 * Registro histórico de UFESP (Unidade Fiscal do Estado de São Paulo).
 *
 * `mes` é 1-indexado (1 = janeiro ... 12 = dezembro) para casar com a
 * leitura humana da tabela oficial divulgada pela SEFAZ-SP.
 */
export interface UfespRecord {
  ano: number
  mes: number
  valor: number
}
