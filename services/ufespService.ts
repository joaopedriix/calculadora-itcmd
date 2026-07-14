import { UFESP_SEED } from "@/data/ufesp"
import type { EdicaoUfespInput, NovoUfespInput, UfespRecord } from "@/types"

/**
 * Único ponto de acesso e mutação da tabela de UFESP. Nenhum componente ou
 * outro serviço deve importar `data/ufesp.ts` diretamente — toda leitura e
 * escrita passa pelas funções abaixo.
 *
 * Hoje os registros vivem em memória (array module-level, populado a partir
 * do seed de exemplo). A API foi desenhada para que, no futuro, esta
 * implementação seja trocada por chamadas a um banco de dados (Supabase /
 * PostgreSQL via Prisma) sem que a interface precise mudar uma linha sequer.
 *
 * Nota de arquitetura enquanto o armazenamento for em memória: qualquer
 * página que leia ou escreva UFESP precisa ser Client Component ("use
 * client"). Módulos sem diretiva são reinstanciados separadamente no
 * servidor e no navegador — se uma página fosse Server Component, ela leria
 * uma cópia do array que nunca recebe as mutações feitas pela tela
 * administrativa no navegador. Isso deixa de ser um problema assim que a
 * migração para banco de dados acontecer.
 */
let registros: UfespRecord[] = [...UFESP_SEED]

/** Sentinela para "sem data final" ao comparar intervalos de vigência. */
const DATA_MAXIMA = new Date(8640000000000000)

function gerarId(): string {
  return `ufesp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function derivarAnoMesDia(data: Date) {
  return {
    ano: data.getFullYear(),
    mes: data.getMonth() + 1,
    dia: data.getDate(),
  }
}

function ordenarPorVigencia(lista: UfespRecord[]): UfespRecord[] {
  return [...lista].sort(
    (a, b) => a.dataInicioVigencia.getTime() - b.dataInicioVigencia.getTime()
  )
}

/**
 * Localiza o registro cuja vigência contempla exatamente a data informada.
 *
 * A busca NUNCA considera apenas ano/mês: historicamente a UFESP já teve
 * reajustes mensais e até diários, então o intervalo
 * [`dataInicioVigencia`, `dataFimVigencia`] é sempre a fonte da verdade.
 * Se, por inconsistência de cadastro, mais de um registro colidir na mesma
 * data, prevalece o de início de vigência mais recente.
 */
export function buscarUFESP(data: Date): UfespRecord | null {
  const candidatos = registros.filter((registro) => {
    const iniciouAntesOuNaData = registro.dataInicioVigencia <= data
    const aindaVigente =
      registro.dataFimVigencia === null || registro.dataFimVigencia >= data
    return iniciouAntesOuNaData && aindaVigente
  })

  if (candidatos.length === 0) return null

  return candidatos.reduce((maisRecente, atual) =>
    atual.dataInicioVigencia > maisRecente.dataInicioVigencia ? atual : maisRecente
  )
}

/** UFESP vigente hoje (mesma lógica de vigência de `buscarUFESP`). */
export function buscarUFESPAtual(): UfespRecord | null {
  return buscarUFESP(new Date())
}

/** Todos os registros cujo início de vigência cai no ano informado. */
export function buscarPorAno(ano: number): UfespRecord[] {
  return ordenarPorVigencia(registros.filter((registro) => registro.ano === ano))
}

/** Todos os registros cuja vigência tem qualquer sobreposição com [inicio, fim]. */
export function buscarPorPeriodo(inicio: Date, fim: Date): UfespRecord[] {
  return ordenarPorVigencia(
    registros.filter((registro) => {
      const fimRegistro = registro.dataFimVigencia ?? DATA_MAXIMA
      return registro.dataInicioVigencia <= fim && fimRegistro >= inicio
    })
  )
}

/** Lista completa, ordenada cronologicamente pelo início de vigência. */
export function listarTodas(): UfespRecord[] {
  return ordenarPorVigencia(registros)
}

/** Cria um novo registro de UFESP. `ano`/`mes`/`dia` são sempre derivados. */
export function adicionar(dados: NovoUfespInput): UfespRecord {
  const agora = new Date()
  const novo: UfespRecord = {
    id: gerarId(),
    dataInicioVigencia: dados.dataInicioVigencia,
    dataFimVigencia: dados.dataFimVigencia ?? null,
    ...derivarAnoMesDia(dados.dataInicioVigencia),
    valor: dados.valor,
    fonte: dados.fonte,
    observacoes: dados.observacoes,
    createdAt: agora,
    updatedAt: agora,
  }

  registros = [...registros, novo]
  return novo
}

/** Atualiza um registro existente. `ano`/`mes`/`dia` são sempre re-derivados. */
export function editar(id: string, dados: EdicaoUfespInput): UfespRecord {
  const existente = registros.find((registro) => registro.id === id)
  if (!existente) {
    throw new Error(`Registro de UFESP não encontrado: ${id}`)
  }

  const atualizado: UfespRecord = {
    ...existente,
    dataInicioVigencia: dados.dataInicioVigencia,
    dataFimVigencia: dados.dataFimVigencia ?? null,
    ...derivarAnoMesDia(dados.dataInicioVigencia),
    valor: dados.valor,
    fonte: dados.fonte,
    observacoes: dados.observacoes,
    updatedAt: new Date(),
  }

  registros = registros.map((registro) => (registro.id === id ? atualizado : registro))
  return atualizado
}

/** Remove um registro. Não lança erro se o id não existir. */
export function remover(id: string): void {
  registros = registros.filter((registro) => registro.id !== id)
}

/**
 * PREPARADO PARA IMPLEMENTAÇÃO FUTURA — ainda não funcional nesta versão.
 *
 * Deverá importar automaticamente a tabela histórica da UFESP a partir do
 * site oficial da Secretaria da Fazenda do Estado de São Paulo, permitindo:
 *   - sincronização anual da tabela;
 *   - atualização manual disparada pelo administrador (este botão);
 *   - substituição/complementação dos registros hoje mantidos em memória.
 *
 * Quando implementada, deve continuar sendo o único ponto de entrada de
 * dados externos — o restante da aplicação não deve saber de onde vieram.
 */
export async function importarTabelaUFESP(): Promise<void> {
  throw new Error("Importação automática da tabela UFESP ainda não implementada.")
}
