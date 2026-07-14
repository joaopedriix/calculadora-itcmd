/**
 * UFESP ATUAL — VALOR DE EXEMPLO (NÃO OFICIAL)
 *
 * Mantido em arquivo isolado, como pedido, para que no futuro esta constante
 * possa ser substituída por uma consulta a uma API/banco de dados sem afetar
 * o restante da aplicação (todo acesso passa por `services/ufespService.ts`).
 *
 * ONDE ATUALIZAR:
 * Sempre que a SEFAZ-SP divulgar um novo valor de UFESP vigente, atualize
 * `valor` e `referencia` abaixo.
 */
export const UFESP_ATUAL = {
  valor: 35.18,
  referencia: "Janeiro/2026",
} as const
