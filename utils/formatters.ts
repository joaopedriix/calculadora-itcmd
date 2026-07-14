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

const currencyPrecisoFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
})

/** Formata um número como moeda brasileira (ex.: 1234.5 -> "R$ 1.234,50"). */
export function formatCurrency(valor: number): string {
  return currencyFormatter.format(valor)
}

/**
 * Formata um valor em Real com até 8 casas decimais — usado só para valores
 * intermediários de auditoria (ex.: conversão monetária de eras
 * hiperinflacionárias), onde arredondar em 2 casas decimais faria um valor
 * real virar "R$ 0,00" e esconder a divisão que de fato ocorreu.
 */
export function formatCurrencyPreciso(valor: number): string {
  return currencyPrecisoFormatter.format(valor)
}

/**
 * Formata um valor com o símbolo de uma moeda histórica (ex.: "Cr$
 * 1.996,31"). Usar sempre que o valor NÃO estiver garantidamente em Real —
 * um valor histórico de UFESP ou de bens quase sempre está em outra moeda
 * (Cruzeiro, Cruzado, Cruzado Novo, Cruzeiro Real), e `formatCurrency`
 * sempre imprime "R$", o que mentiria sobre a moeda real do valor.
 */
export function formatValorNaMoeda(valor: number, simboloMoeda: string): string {
  const numeroFormatado = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${simboloMoeda} ${numeroFormatado}`
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

/**
 * Formata um período de vigência (ex.: "01/04/1992 até 30/04/1992" ou
 * "01/07/2026 até o momento", quando ainda não há data final).
 */
export function formatPeriodoVigencia(
  dataInicio: Date,
  dataFim: Date | null
): string {
  const inicio = formatDate(dataInicio)
  return dataFim ? `${inicio} até ${formatDate(dataFim)}` : `${inicio} até o momento`
}
