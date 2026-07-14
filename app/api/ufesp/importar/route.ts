import { NextResponse } from "next/server"

import { importarUfespDaSefaz } from "@/scripts/lib/ufespImporter"
import { gravarBaseUfesp } from "@/scripts/lib/ufespWriter"

// O importador usa Playwright (Chromium headless) para renderizar a página
// oficial — isso exige Node.js, não roda no runtime Edge.
export const runtime = "nodejs"

// Cold start (baixar/extrair o Chromium serverless) + navegação + parse de
// ~35 anos de tabelas pode passar do limite padrão de execução da Vercel.
export const maxDuration = 60

/**
 * Aciona o botão "Atualizar Base Oficial" da tela `/ufesp`
 * (`services/ufespService.ts` → `importarTabelaUFESP()`). Roda o mesmo
 * scraper/parser do `npm run importar-ufesp` e devolve os registros
 * atualizados para o cliente substituir a base em memória sem precisar
 * recarregar a página.
 *
 * Em ambiente local/self-hosted, também grava `data/ufesp.json` em disco
 * (persistindo entre reinicializações). Em ambiente serverless (Vercel,
 * Lambda) isso NÃO é possível — só `/tmp` é gravável em produção — então
 * `gravarBaseUfesp` pula a escrita e devolve `persistido: false`; a UI usa
 * essa informação para avisar que a atualização vale só para a sessão atual
 * (ver `scripts/lib/ufespWriter.ts`).
 *
 * Em caso de erro, a base existente em `data/ufesp.json` NÃO é tocada — o
 * erro é registrado no log do servidor e uma mensagem amigável é devolvida
 * para a UI exibir em um toast.
 */
export async function POST() {
  try {
    const registros = await importarUfespDaSefaz()
    const { persistido } = await gravarBaseUfesp(registros)
    return NextResponse.json({ ok: true, registros, total: registros.length, persistido })
  } catch (erro) {
    console.error("Falha ao importar a tabela oficial da UFESP:", erro)
    const message =
      erro instanceof Error
        ? erro.message
        : "Falha ao importar a tabela oficial da UFESP."
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
