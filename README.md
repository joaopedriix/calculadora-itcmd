# Calculadora de ITCMD por UFESP

Sistema para cálculo de ITCMD de óbitos antigos do Estado de São Paulo, por
atualização de patrimônio via UFESP, com módulo administrativo para
manutenção da tabela histórica. Construído em Next.js (App Router) +
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

## Páginas

- **Dashboard** (`/`) — visão geral: UFESP vigente hoje, total de registros
  cadastrados e atalhos para as demais telas.
- **Calcular ITCMD** (`/calcular`) — a calculadora em si.
- **Tabela Histórica UFESP** (`/ufesp`) — módulo administrativo (CRUD) da
  tabela de UFESP: filtros, criação/edição/exclusão/visualização de
  registros, exportação em CSV/Excel e um botão de importação preparado
  para integração futura.
- **Configurações** (`/configuracoes`) — reservada para evoluções futuras.

## ⚠️ Onde alimentar a tabela histórica da UFESP (IMPORTANTE)

Os dados de UFESP que acompanham este sistema **não são os valores
oficiais** — são placeholders (uma progressão artificial de R$ 0,01 por mês,
gerados em `data/ufesp.ts`) que existem apenas para permitir testar o fluxo
completo do sistema ponta a ponta.

Antes de usar a calculadora para gerar guias reais, alimente a tabela oficial
da SEFAZ-SP **pela própria tela "Tabela Histórica UFESP"** (`/ufesp`), criando
um registro por período de vigência — não precisa editar código. `data/ufesp.ts`
é usado apenas como carga inicial (seed) na primeira execução.

Cada registro tem um período de vigência explícito
(`dataInicioVigencia` até `dataFimVigencia`, esta última opcional para
"ainda vigente"), porque a UFESP nem sempre mudou apenas uma vez por ano —
em diversos períodos históricos houve reajustes mensais e até diários. A
busca usada pela calculadora localiza sempre o registro cuja vigência
contempla exatamente a data do falecimento, nunca apenas por ano/mês.

### Armazenamento em memória (nesta versão)

Os registros vivem em memória no navegador (não há banco de dados ainda).
Isso significa que:

- Alterações feitas na tela `/ufesp` refletem imediatamente na calculadora e
  no dashboard **enquanto a aba não for recarregada** (navegação entre
  páginas do menu lateral não perde os dados).
- Um recarregamento completo da página (F5) volta para os dados de exemplo
  de `data/ufesp.ts`.
- Nenhum componente acessa `data/ufesp.ts` diretamente — tudo passa por
  `services/ufespService.ts`, o que permite trocar esse armazenamento por um
  banco de dados (Supabase/PostgreSQL via Prisma) no futuro sem alterar a
  interface.

## Arquitetura

```
app/
  page.tsx            Dashboard
  calcular/           Calculadora de ITCMD
  ufesp/              Tela administrativa da Tabela Histórica UFESP
  configuracoes/      Reservada para o futuro
components/
  ui/                 Primitivos shadcn/ui (Button, Card, Table, Dialog, Sidebar...)
  form/               Campos reutilizáveis (DatePicker, CurrencyInput, FormRow)
  processo/           Seção "Dados do Processo" e painel "Resumo do Processo"
  calculo/            Seção "Dados do Cálculo", Resultado, UFESP utilizada e Memorial
  ufesp/              Filtros, tabela, dialogs de criar/editar/excluir da tela /ufesp
  layout/             Sidebar de navegação e PageHeader
services/             Regra de negócio pura (calculoService, ufespService)
hooks/                useResumoProcesso (prévia em tempo real do painel lateral)
lib/                  Validações Zod e utilitário cn() do shadcn
utils/                Formatadores (moeda, data, UFESP) e exportação CSV/Excel
types/                Interfaces TypeScript compartilhadas
data/                 Carga inicial (seed) da tabela histórica da UFESP
constants/            Alíquota/multa padrão, tipos de cálculo
```

Toda a matemática do cálculo vive em `services/calculoService.ts`, isolada da
interface. Toda leitura e escrita da tabela de UFESP passa por
`services/ufespService.ts`:

```ts
buscarUFESP(data)       // localiza o registro vigente numa data exata
buscarUFESPAtual()      // UFESP vigente hoje
buscarPorAno(ano)
buscarPorPeriodo(inicio, fim)
listarTodas()
adicionar(dados)
editar(id, dados)
remover(id)
importarTabelaUFESP()   // preparado para o futuro, ainda não implementado
```

## Preparado para o futuro

A estrutura foi organizada para facilitar, sem exigir retrabalho:

- **Banco de dados / API**: troque a implementação interna de
  `ufespService.ts` (hoje um array em memória) por chamadas a
  Prisma/Supabase/REST — a assinatura das funções não precisa mudar.
- **Importação automática**: `importarTabelaUFESP()` já existe como contrato
  documentado, pronta para ser implementada com uma integração ao site da
  SEFAZ-SP (sincronização anual + atualização manual).
- **Novos tipos de cálculo**: adicione um novo valor ao union `TipoCalculo`
  (`types/calculo.ts`), uma nova opção em `constants/tiposCalculo.ts` e um novo
  `case` em `executarCalculo` (`services/calculoService.ts`).
- **Persistência de processos/clientes e histórico de cálculos**: os tipos
  `DadosProcesso` e `DadosCalculo` já modelam exatamente os dados que hoje só
  vivem no formulário — prontos para virar tabelas.
- **Exportação em PDF / impressão**: o Memorial de Cálculo já usa marcação
  semântica (`dl`/`dt`/`dd`) e estilos `print:` dedicados; o botão "Imprimir"
  já funciona via `window.print()`.
- **Login, multiusuário e painel administrativo**: a página `/configuracoes`
  já está reservada no menu para essas evoluções.

## Limitações conhecidas do MVP

- Uso pensado para um único advogado; não há autenticação nem multiusuário.
- Nada é persistido em banco — os dados vivem apenas na sessão do navegador
  (ver "Armazenamento em memória" acima).
- A tabela de UFESP precisa ser alimentada manualmente pela tela `/ufesp`.
- "Exportar Excel" gera um arquivo SpreadsheetML (`.xls`), não um `.xlsx`
  binário — decisão deliberada para evitar a dependência `xlsx`/SheetJS, que
  tem vulnerabilidades de alta severidade sem correção publicada. O arquivo
  abre normalmente no Excel e no LibreOffice.
