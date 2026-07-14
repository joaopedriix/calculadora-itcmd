import { mkdtemp, rename, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import type { UfespRecordInput } from "./ufespParser"

// `process.cwd()` (não `__dirname`) porque a rota da API roda dentro do
// bundle do Next.js, onde `__dirname` não corresponde ao caminho real do
// projeto no disco. `process.cwd()` é confiável nos dois contextos (CLI via
// `npm run importar-ufesp` e a rota da API), já que ambos sobem a partir da
// raiz do projeto.
export const CAMINHO_BASE_UFESP = path.join(process.cwd(), "data", "ufesp.json")

/**
 * Ambientes serverless (Vercel, Lambda) só permitem escrita em `/tmp` — o
 * diretório do projeto é somente leitura em produção. Não há como persistir
 * `data/ufesp.json` de volta ao deploy a partir de uma requisição rodando
 * lá; só é possível gravar em disco de verdade rodando localmente
 * (`npm run importar-ufesp`) ou trocando o armazenamento por um banco de
 * dados (ver README).
 */
const EM_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME

/**
 * Grava `data/ufesp.json` de forma atômica (escreve em arquivo temporário e
 * só substitui o destino via rename depois que a escrita termina) —
 * reaproveitado pelo script CLI e pela rota da API para que nenhum dos dois
 * corra o risco de deixar a base existente corrompida por uma escrita
 * parcial.
 *
 * Devolve `persistido: false` (sem lançar erro) quando rodando em ambiente
 * serverless — o chamador decide como comunicar isso ao usuário.
 */
export async function gravarBaseUfesp(
  registros: UfespRecordInput[]
): Promise<{ persistido: boolean }> {
  if (EM_SERVERLESS) {
    console.warn(
      "gravarBaseUfesp: ambiente serverless detectado — data/ufesp.json não foi gravado em disco (somente /tmp é gravável em produção). Os registros importados só valem para esta requisição."
    )
    return { persistido: false }
  }

  const pastaTemporaria = await mkdtemp(path.join(tmpdir(), "ufesp-import-"))
  const arquivoTemporario = path.join(pastaTemporaria, "ufesp.json")

  try {
    await writeFile(arquivoTemporario, JSON.stringify(registros, null, 2) + "\n", "utf8")
    await rename(arquivoTemporario, CAMINHO_BASE_UFESP)
  } finally {
    await rm(pastaTemporaria, { recursive: true, force: true })
  }

  return { persistido: true }
}
