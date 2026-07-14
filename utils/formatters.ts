import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const ufespFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

/** Formata um número como moeda brasileira (ex.: 1234.5 -> "R$ 1.234,50"). */
export function formatCurrency(valor: number): string {
  return currencyFormatter.format(valor)
}

/** Formata uma quantidade de UFESP com até 4 casas decimais. */
export function formatUfesp(valor: number): string {
  return ufespFormatter.format(valor)
}

/** Formata uma data no padrão brasileiro (dd/MM/yyyy). */
export function formatDate(data: Date): string {
  return format(data, "dd/MM/yyyy", { locale: ptBR })
}

/** Formata o mês/ano de uma data (ex.: "Abril de 1992"). */
export function formatMesAno(data: Date): string {
  return format(data, "MMMM 'de' yyyy", { locale: ptBR })
}
