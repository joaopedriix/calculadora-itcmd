/**
 * Dados de identificação do processo.
 *
 * Ainda não persistidos em banco — servem para compor o Memorial de
 * Cálculo e, futuramente, para o cadastro de processos (ver Prisma/Supabase).
 */
export interface DadosProcesso {
  numeroProcesso: string
  nomeFalecido: string
  nomeCliente: string
  observacoes?: string
}
