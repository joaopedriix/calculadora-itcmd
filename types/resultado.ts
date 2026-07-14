/**
 * Saída completa do cálculo de ITCMD por atualização via UFESP.
 * Reúne tudo que é necessário para o Card de Resultado e para o Memorial.
 */
export interface ResultadoCalculo {
  ufespEpoca: number
  ufespAtual: number
  quantidadeUfesp: number
  valorAtualizado: number
  valorItcmd: number
  valorMulta: number
  valorTotal: number
}
