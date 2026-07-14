import type { TipoCalculo } from "@/types"

/**
 * Opções do Select "Tipo de cálculo". Estruturado como lista para permitir
 * adicionar novas estratégias de atualização no futuro sem tocar na UI.
 */
export const TIPOS_CALCULO: { value: TipoCalculo; label: string }[] = [
  { value: "atualizacao_ufesp", label: "Atualização por UFESP" },
]
