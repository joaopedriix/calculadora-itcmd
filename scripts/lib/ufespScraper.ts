import { chromium, type Browser } from "playwright-core"

import { FONTE_EXTRATOR_UFESP } from "./ufespBrowserExtractorSource"
import type { RawUfespItem } from "./ufespRaw"

export const URL_OFICIAL_UFESP =
  "https://legislacao.fazenda.sp.gov.br/Paginas/ValoresDaUFESP.aspx"

/**
 * Local (Windows/macOS/Linux dev): usa o Chromium baixado pelo pacote
 * `playwright` completo (devDependency, via `npx playwright install
 * chromium`) — `playwright-core` sozinho já sabe localizá-lo.
 *
 * Vercel (e qualquer Lambda-like serverless): o Chromium completo não roda
 * nesse ambiente, então usamos `@sparticuz/chromium`, que empacota um
 * binário compatível e compacto para essas plataformas.
 */
async function lancarChromium(): Promise<Browser> {
  const emServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME

  if (!emServerless) {
    return chromium.launch()
  }

  const chromiumServerless = (await import("@sparticuz/chromium")).default
  return chromium.launch({
    args: chromiumServerless.args,
    executablePath: await chromiumServerless.executablePath(),
  })
}

/**
 * Abre a página oficial em um Chromium headless e devolve a sequência bruta
 * de tabelas/títulos já renderizada pelo JavaScript da página.
 *
 * A página não expõe API, JSON, XML nem chamadas AJAX com os dados
 * (investigado manualmente antes de implementar este scraper) — o conteúdo é
 * injetado no DOM por um componente SharePoint client-side rendering. Por
 * isso a única forma viável de obter os dados é renderizar a página com um
 * navegador real e ler o DOM já processado, em vez de um `fetch`/`curl`.
 *
 * A extração roda inteiramente dentro do navegador; a lógica em si vive em
 * `ufespBrowserExtractorSource.ts` (ver o comentário lá sobre por que é uma
 * string de código, não uma função TypeScript normal).
 */
export async function coletarSequenciaBrutaUFESP(): Promise<RawUfespItem[]> {
  const browser = await lancarChromium()
  try {
    const page = await browser.newPage()
    await page.goto(URL_OFICIAL_UFESP, { waitUntil: "networkidle", timeout: 60_000 })
    return await page.evaluate<RawUfespItem[]>(FONTE_EXTRATOR_UFESP)
  } finally {
    await browser.close()
  }
}
