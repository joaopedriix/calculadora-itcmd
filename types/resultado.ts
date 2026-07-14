/** Recorte da UFESP localizada para a data do falecimento, com proveniência. */
export interface UfespUtilizada {
  valor: number
  dataInicioVigencia: Date
  dataFimVigencia: Date | null
  baseLegal?: string
  fonte: string
  observacoes?: string
}

/**
 * Saída completa do cálculo de ITCMD por atualização via UFESP.
 * Reúne tudo que é necessário para o Card de Resultado e para o Memorial.
 */
export interface ResultadoCalculo {
  ufespUtilizada: UfespUtilizada
  ufespAtual: number
  quantidadeUfesp: number
  valorAtualizado: number
  valorItcmd: number
  valorMulta: number
  valorTotal: number
}
