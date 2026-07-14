/**
 * Registro histórico de UFESP (Unidade Fiscal do Estado de São Paulo).
 *
 * A UFESP nem sempre foi reajustada apenas anualmente — em diversos
 * períodos houve alterações mensais e até diárias. Por isso a fonte da
 * verdade para localizar o valor vigente em uma data é sempre o intervalo
 * [`dataInicioVigencia`, `dataFimVigencia`], nunca `ano`/`mes` isolados.
 *
 * `ano`, `mes` e `dia` são derivados de `dataInicioVigencia` e mantidos
 * apenas para exibição/filtros na tela administrativa — nunca devem ser
 * editados de forma independente da data de vigência (ver ufespService).
 */
export interface UfespRecord {
  id: string
  dataInicioVigencia: Date
  /** `null` significa "vigente até hoje" (sem data final definida). */
  dataFimVigencia: Date | null
  ano: number
  mes: number
  dia: number
  valor: number
  fonte: string
  observacoes?: string
  createdAt: Date
  updatedAt: Date
}

/** Dados informados pelo usuário ao criar um registro. */
export interface NovoUfespInput {
  dataInicioVigencia: Date
  dataFimVigencia?: Date | null
  valor: number
  fonte: string
  observacoes?: string
}

/** Dados informados pelo usuário ao editar um registro existente. */
export type EdicaoUfespInput = NovoUfespInput
