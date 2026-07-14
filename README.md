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
npm run test    # testes unitários (vitest)
```

## Páginas

- **Dashboard** (`/`) — visão geral: UFESP vigente hoje, total de registros
  cadastrados e atalhos para as demais telas.
- **Calcular ITCMD** (`/calcular`) — a calculadora em si.
- **Tabela Histórica UFESP** (`/ufesp`) — módulo administrativo (CRUD) da
  tabela de UFESP: filtros, criação/edição/exclusão/visualização de
  registros, exportação em CSV/Excel e um botão "Atualizar Base Oficial" que
  reimporta a tabela direto da SEFAZ-SP.
- **Configurações** (`/configuracoes`) — reservada para evoluções futuras.

## Tabela histórica da UFESP: fonte e importação automática

A tabela de UFESP usada pela calculadora vem **exclusivamente** da página
oficial da Secretaria da Fazenda do Estado de São Paulo
([legislacao.fazenda.sp.gov.br/Paginas/ValoresDaUFESP.aspx](https://legislacao.fazenda.sp.gov.br/Paginas/ValoresDaUFESP.aspx)).
Nenhum valor é digitado manualmente: `data/ufesp.json` é gerado por
`scripts/importar-ufesp.ts`, que abre essa página oficial e extrai a tabela
histórica completa (1989–hoje).

Para atualizar a base, rode:

```bash
npm run importar-ufesp
```

ou clique em **"Atualizar Base Oficial"** na tela `/ufesp` (mesma lógica,
disparada via `app/api/ufesp/importar/route.ts`). Em ambos os casos, a base
existente só é substituída depois que a importação e as validações de
sanidade terminam com sucesso — se a importação falhar, `data/ufesp.json`
permanece intacto e o erro é registrado no log.

### Por que scraping (e não uma API)

A página oficial não expõe API, JSON, XML nem chamadas AJAX com os dados — o
conteúdo é renderizado no DOM por um componente SharePoint client-side
rendering. Por isso o importador usa um Chromium headless (Playwright) para
renderizar a página e ler a tabela já processada, em vez de um `fetch`/`curl`
simples (ver `scripts/lib/ufespScraper.ts`).

### Granularidade e período de vigência

Cada registro tem um período de vigência explícito
(`dataInicioVigencia` até `dataFimVigencia`), porque a UFESP nem sempre mudou
apenas uma vez por ano — a fonte oficial já publicou reajustes anuais,
semestrais, mensais e diários em diferentes épocas. O importador
(`scripts/lib/ufespParser.ts`) trata as quatro granularidades e nunca assume
um valor único por ano; em dias sem publicação (fins de semana/feriados), o
valor vigente é o último publicado (carry-forward), nunca um valor novo. A
busca usada pela calculadora localiza sempre o registro cuja vigência
contempla exatamente a data do falecimento, nunca apenas por ano/mês.

### Valores na moeda da época, na base

Os registros anteriores a 01/07/1994 são gravados na moeda oficial vigente
naquela data (Cruzados Novos, Cruzeiros ou Cruzeiros Reais), exatamente como
publicado pela fonte — a base (`data/ufesp.json`) nunca converte para Real.
Cada registro nessas condições traz uma observação automática indicando a
moeda vigente. A conversão para Real acontece só na hora do cálculo (ver
seção seguinte), nunca na importação.

## Conversão monetária histórica

Antes de dividir "valor dos bens ÷ UFESP da época", a calculadora converte os
dois lados para Real usando a cadeia oficial de padrões monetários
brasileiros (`services/conversaoMonetariaService.ts`), verificada contra o
Banco Central do Brasil e consistente com o rodapé da própria página oficial
da UFESP:

| Moeda | Vigência | Fator para a próxima |
|---|---|---|
| Cruzeiro | 11/01/1942–13/02/1967 | 1.000 Cr$ = 1 NCr$ |
| Cruzeiro Novo | 13/02/1967–15/05/1970 | 1 NCr$ = 1 Cr$ (renomeação) |
| Cruzeiro | 15/05/1970–28/02/1986 | 1.000 Cr$ = 1 Cz$ |
| Cruzado | 28/02/1986–16/01/1989 | 1.000 Cz$ = 1 NCz$ |
| Cruzado Novo | 16/01/1989–16/03/1990 | 1 NCz$ = 1 Cr$ (renomeação) |
| Cruzeiro | 16/03/1990–01/08/1993 | 1.000 Cr$ = 1 CR$ |
| Cruzeiro Real | 01/08/1993–01/07/1994 | 2.750 CR$ = 1 R$ |
| Real | desde 01/07/1994 | — |

Nenhum fator é fixo/hardcoded fora dessa tabela — todos são o produto dos
fatores oficiais de cada transição, na cadeia até o Real.

**Por que isso não muda os resultados no caso normal:** se o valor dos bens e
a UFESP da época estiverem na mesma moeda (o padrão, já que a UFESP é
detectada automaticamente pela data), o fator de conversão se cancela na
divisão — o resultado final é idêntico a dividir os valores brutos sem
converter. A conversão só muda o resultado quando o advogado declara
explicitamente uma moeda diferente da detectada (campo **"Moeda do Valor
Informado"**, na tela `/calcular`) — por exemplo, quando o valor lançado já
veio de uma atualização anterior e está em uma moeda diferente da vigente na
data do falecimento.

Toda a conversão é auditável: o card **"Conversão Monetária"** e o Memorial de
Cálculo mostram moeda original, valor original, valor convertido, fator
aplicado e base legal — tanto para o valor dos bens quanto para a UFESP da
época.

### Armazenamento em memória (nesta versão)

Os registros vivem em memória no navegador (não há banco de dados ainda).
Isso significa que:

- Alterações feitas na tela `/ufesp` refletem imediatamente na calculadora e
  no dashboard **enquanto a aba não for recarregada** (navegação entre
  páginas do menu lateral não perde os dados).
- Um recarregamento completo da página (F5) volta para a base oficial
  gravada em `data/ufesp.json`.
- Nenhum componente acessa `data/ufesp.ts`/`data/ufesp.json` diretamente — tudo passa por
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
  api/ufesp/importar/ Rota que aciona o "Atualizar Base Oficial" no servidor
components/
  ui/                 Primitivos shadcn/ui (Button, Card, Table, Dialog, Sidebar...)
  form/               Campos reutilizáveis (DatePicker, CurrencyInput, FormRow)
  processo/           Seção "Dados do Processo" e painel "Resumo do Processo"
  calculo/            Seção "Dados do Cálculo", Resultado, UFESP utilizada e Memorial
  ufesp/              Filtros, tabela, dialogs de criar/editar/excluir da tela /ufesp
  layout/             Sidebar de navegação e PageHeader
services/             Regra de negócio pura (calculoService, ufespService,
                      conversaoMonetariaService) + testes unitários (*.test.ts)
hooks/                useResumoProcesso (prévia em tempo real do painel lateral)
lib/                  Validações Zod e utilitário cn() do shadcn
utils/                Formatadores (moeda, data, UFESP) e exportação CSV/Excel
types/                Interfaces TypeScript compartilhadas
data/                 ufesp.json (base oficial) + adaptador ufesp.ts (seed)
constants/            Alíquota/multa padrão, tipos de cálculo
scripts/              Importador oficial da UFESP (scraper + parser + CLI)
```

Toda a matemática do cálculo vive em `services/calculoService.ts`, isolada da
interface. Toda leitura e escrita da tabela de UFESP passa por
`services/ufespService.ts`:

```ts
buscarUFESP(data)       // localiza o registro vigente numa data exata
buscarUFESPAtual()      // UFESP vigente hoje
buscarPorAno(ano)
buscarPorPeriodo(inicio, fim)
listarUFESP()
adicionar(dados)
editar(id, dados)
remover(id)
importarTabelaUFESP()   // reimporta da SEFAZ-SP via app/api/ufesp/importar
```

## Preparado para o futuro

A estrutura foi organizada para facilitar, sem exigir retrabalho:

- **Banco de dados / API**: troque a implementação interna de
  `ufespService.ts` (hoje um array em memória) por chamadas a
  Prisma/Supabase/REST — a assinatura das funções não precisa mudar.
- **Sincronização automática**: hoje a reimportação é sob demanda (CLI ou
  botão); rodar `scripts/importar-ufesp.ts` num cron/job agendado (ex.: todo
  dezembro, quando a SEFAZ-SP costuma publicar o Comunicado do ano seguinte)
  dá sincronização anual sem exigir nenhuma mudança de arquitetura.
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
  (ver "Armazenamento em memória" acima); `data/ufesp.json` é a base
  gravada em disco, mas as edições feitas pela tela `/ufesp` só ficam em
  memória até uma reimportação ou até existir banco de dados.
- O botão "Atualizar Base Oficial" roda um Chromium headless no servidor.
  Localmente usa o Chromium do pacote `playwright`; em produção na Vercel (ou
  outro serverless com as mesmas variáveis de ambiente) usa
  `@sparticuz/chromium` + `playwright-core` automaticamente — não precisa de
  configuração adicional (ver `scripts/lib/ufespScraper.ts`).
- Em ambiente serverless o botão **não persiste** `data/ufesp.json` em disco
  (só `/tmp` é gravável em produção lá) — a atualização vale só para a sessão
  atual e some no próximo recarregamento/deploy; a UI avisa isso no toast. Para
  persistir de verdade, rode `npm run importar-ufesp` localmente e faça commit
  do `data/ufesp.json` atualizado, ou troque o armazenamento por um banco de
  dados.
- "Exportar Excel" gera um arquivo SpreadsheetML (`.xls`), não um `.xlsx`
  binário — decisão deliberada para evitar a dependência `xlsx`/SheetJS, que
  tem vulnerabilidades de alta severidade sem correção publicada. O arquivo
  abre normalmente no Excel e no LibreOffice.
