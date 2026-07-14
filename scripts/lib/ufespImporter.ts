import { coletarSequenciaBrutaUFESP } from "./ufespScraper"
import { parseSequenciaUfesp, type UfespRecordInput } from "./ufespParser"

/**
 * Orquestra a importação completa (scraper + parser). Compartilhado pelo
 * script de linha de comando (`scripts/importar-ufesp.ts`) e pela rota da
 * API (`app/api/ufesp/importar/route.ts`) — nenhum dos dois duplica a
 * lógica de importação, só decidem o que fazer com o resultado.
 */
export async function importarUfespDaSefaz(): Promise<UfespRecordInput[]> {
  const sequenciaBruta = await coletarSequenciaBrutaUFESP()
  return parseSequenciaUfesp(sequenciaBruta)
}
