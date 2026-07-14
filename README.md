# Calculadora de ITCMD por UFESP

MVP para cálculo de ITCMD de óbitos antigos do Estado de São Paulo, por
atualização de patrimônio via UFESP. Construído em Next.js (App Router) +
TypeScript + TailwindCSS + shadcn/ui + React Hook Form + Zod.

## Como rodar localmente

Pré-requisitos: Node.js 20.9+ e npm.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # ESLint
```

## ⚠️ Onde alimentar a tabela histórica da UFESP (IMPORTANTE)

Os dados de UFESP que acompanham este MVP **não são os valores oficiais** —
são placeholders (uma progressão artificial de R$ 0,01 por mês) que existem
apenas para permitir testar o fluxo completo da calculadora ponta a ponta.

Antes de usar a calculadora para gerar guias reais, é necessário substituir:

1. **`data/ufesp.ts`** — array `UFESP_HISTORICO`. Substitua pela tabela
   histórica oficial da SEFAZ-SP, mês a mês, no formato:
   ```ts
   { ano: 1992, mes: 4, valor: 12.34 } // mes é 1-indexado (1=janeiro)
   ```
2. **`constants/ufespAtual.ts`** — objeto `UFESP_ATUAL`. Atualize `valor` e
   `referencia` sempre que a SEFAZ-SP divulgar um novo valor vigente.

Nenhum outro arquivo acessa esses dados diretamente — tudo passa por
`services/ufespService.ts` (`buscarUFESP`, `buscarUFESPAtual`, `listarUFESP`),
o que permite trocar essa fonte por um banco de dados ou API no futuro sem
alterar o restante da aplicação.

## Arquitetura

```
app/            Rotas e layout (App Router)
components/
  ui/           Primitivos shadcn/ui (Button, Card, Select, Field, etc.)
  form/         Campos reutilizáveis (DatePicker, CurrencyInput, FormRow)
  processo/     Seção "Dados do Processo" e painel "Resumo do Processo"
  calculo/      Seção "Dados do Cálculo", Resultado e Memorial de Cálculo
  layout/       Header do dashboard
services/       Regra de negócio pura (calculoService, ufespService)
hooks/          useResumoProcesso (prévia em tempo real do painel lateral)
lib/            Validações Zod e utilitário cn() do shadcn
utils/          Formatadores (moeda, data, UFESP)
types/          Interfaces TypeScript compartilhadas
data/           Tabela histórica da UFESP (ver aviso acima)
constants/      UFESP atual, alíquota/multa padrão, tipos de cálculo
```

Toda a matemática do cálculo vive em `services/calculoService.ts`, isolada da
interface. A busca de UFESP é isolada em `services/ufespService.ts`.

## Preparado para o futuro

A estrutura foi organizada para facilitar, sem exigir retrabalho:

- **Banco de dados / API**: troque a implementação de `ufespService.ts` (hoje
  lendo `data/ufesp.ts`) por chamadas a Prisma/Supabase/REST — a assinatura
  das funções (`buscarUFESP`, `buscarUFESPAtual`, `listarUFESP`) não precisa
  mudar.
- **Novos tipos de cálculo**: adicione um novo valor ao union `TipoCalculo`
  (`types/calculo.ts`), uma nova opção em `constants/tiposCalculo.ts` e um novo
  `case` em `executarCalculo` (`services/calculoService.ts`).
- **Persistência de processos/clientes e histórico de cálculos**: os tipos
  `DadosProcesso` e `DadosCalculo` já modelam exatamente os dados que hoje só
  vivem no formulário — prontos para virar tabelas.
- **Exportação em PDF / impressão**: o Memorial de Cálculo já usa marcação
  semântica (`dl`/`dt`/`dd`) e estilos `print:` dedicados; o botão "Imprimir"
  já funciona via `window.print()`.

## Limitações conhecidas do MVP

- Uso pensado para um único advogado; não há autenticação nem multiusuário.
- Nada é persistido em banco — cada cálculo vive apenas na sessão do navegador.
- A tabela de UFESP precisa ser alimentada manualmente (ver seção acima).
