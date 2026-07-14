import { importarUfespDaSefaz } from "./lib/ufespImporter"
import { CAMINHO_BASE_UFESP, gravarBaseUfesp } from "./lib/ufespWriter"

/**
 * Importa a tabela histórica oficial da UFESP e grava `data/ufesp.json`.
 * Executar via `npm run importar-ufesp`.
 *
 * Nunca apaga a base existente em caso de erro: só escrevemos o destino
 * (via `gravarBaseUfesp`, com rename atômico) depois que a importação e as
 * validações de sanidade terminam com sucesso.
 */
async function main() {
  const inicio = Date.now()
  console.log("Importando tabela histórica da UFESP da página oficial da SEFAZ-SP...")

  const registros = await importarUfespDaSefaz()
  await gravarBaseUfesp(registros)

  const primeiro = registros[0]
  const ultimo = registros[registros.length - 1]
  const segundos = ((Date.now() - inicio) / 1000).toFixed(1)

  console.log(`Importação concluída em ${segundos}s.`)
  console.log(`Registros: ${registros.length}`)
  console.log(`Período coberto: ${primeiro.dataInicioVigencia} até ${ultimo.dataFimVigencia}`)
  console.log(`Base atualizada em: ${CAMINHO_BASE_UFESP}`)
}

main().catch((erro) => {
  console.error("Falha ao importar a tabela de UFESP — a base existente NÃO foi alterada.")
  console.error(erro instanceof Error ? erro.message : erro)
  process.exitCode = 1
})
