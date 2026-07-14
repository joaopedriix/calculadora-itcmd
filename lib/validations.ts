import { z } from "zod"

/**
 * Schema único do formulário do dashboard. Os campos da Seção 1 (dados do
 * processo) são de preenchimento livre; as regras de negócio obrigatórias
 * (valor e data) incidem apenas sobre a Seção 2 (dados do cálculo).
 */
export const calculoFormSchema = z.object({
  // Seção 1 — Dados do Processo
  numeroProcesso: z.string(),
  nomeFalecido: z.string(),
  nomeCliente: z.string(),
  observacoes: z.string(),

  // Seção 2 — Dados do Cálculo
  dataFalecimento: z
    .date({ error: "Informe a data do falecimento." })
    .refine((data) => data <= new Date(), {
      error: "A data do falecimento não pode ser uma data futura.",
    }),
  valorBens: z
    .number({ error: "Informe o valor dos bens." })
    .positive({ error: "O valor dos bens deve ser maior que zero." }),
  aliquotaItcmd: z
    .number({ error: "Informe a alíquota do ITCMD." })
    .min(0, { error: "A alíquota não pode ser negativa." })
    .max(100, { error: "A alíquota não pode ultrapassar 100%." }),
  percentualMulta: z
    .number({ error: "Informe o percentual da multa." })
    .min(0, { error: "A multa não pode ser negativa." })
    .max(100, { error: "A multa não pode ultrapassar 100%." }),
  tipoCalculo: z.enum(["atualizacao_ufesp"]),
})

export type CalculoFormValues = z.infer<typeof calculoFormSchema>

/**
 * Schema do formulário de criação/edição de um registro na Tabela Histórica
 * UFESP. `dataFimVigencia` é opcional (registro "ainda vigente").
 */
export const ufespFormSchema = z
  .object({
    dataInicioVigencia: z.date({
      error: "Informe a data inicial de vigência.",
    }),
    dataFimVigencia: z.date().nullable(),
    valor: z
      .number({ error: "Informe o valor da UFESP." })
      .positive({ error: "O valor da UFESP deve ser maior que zero." }),
    baseLegal: z.string(),
    fonte: z
      .string()
      .trim()
      .min(1, { error: "Informe a fonte da informação." }),
    observacoes: z.string(),
  })
  .refine(
    (dados) =>
      !dados.dataFimVigencia || dados.dataFimVigencia >= dados.dataInicioVigencia,
    {
      error: "A data final de vigência não pode ser anterior à data inicial.",
      path: ["dataFimVigencia"],
    }
  )

export type UfespFormValues = z.infer<typeof ufespFormSchema>
