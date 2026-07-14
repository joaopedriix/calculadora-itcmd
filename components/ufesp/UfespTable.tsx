"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buscarRegimePorCodigo } from "@/services/conversaoMonetariaService"
import { formatDate, formatValorNaMoeda } from "@/utils/formatters"
import type { UfespRecord } from "@/types"

const ITENS_POR_PAGINA = 15

interface UfespTableProps {
  registros: UfespRecord[]
  onVisualizar: (registro: UfespRecord) => void
  onEditar: (registro: UfespRecord) => void
  onExcluir: (registro: UfespRecord) => void
}

export function UfespTable({
  registros,
  onVisualizar,
  onEditar,
  onExcluir,
}: UfespTableProps) {
  const [pagina, setPagina] = useState(1)

  // Sempre que a lista filtrada mudar, volta para a primeira página.
  // (ajuste de estado durante a renderização, sem useEffect — ver
  // https://react.dev/learn/you-might-not-need-an-effect)
  const [registrosAnteriores, setRegistrosAnteriores] = useState(registros)
  if (registros !== registrosAnteriores) {
    setRegistrosAnteriores(registros)
    setPagina(1)
  }

  const totalPaginas = Math.max(1, Math.ceil(registros.length / ITENS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  const registrosPagina = registros.slice(inicio, inicio + ITENS_POR_PAGINA)

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Início vigência</TableHead>
              <TableHead>Fim vigência</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Mês</TableHead>
              <TableHead>Dia</TableHead>
              <TableHead>Valor UFESP</TableHead>
              <TableHead>Moeda</TableHead>
              <TableHead>Base Legal</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrosPagina.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                  Nenhum registro encontrado para os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
            {registrosPagina.map((registro) => (
              <TableRow key={registro.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(registro.dataInicioVigencia)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {registro.dataFimVigencia ? (
                    formatDate(registro.dataFimVigencia)
                  ) : (
                    <Badge variant="secondary">Vigente</Badge>
                  )}
                </TableCell>
                <TableCell>{registro.ano}</TableCell>
                <TableCell>{registro.mes}</TableCell>
                <TableCell>{registro.dia}</TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatValorNaMoeda(
                    registro.valor,
                    buscarRegimePorCodigo(registro.moeda).simbolo
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {buscarRegimePorCodigo(registro.moeda).nome}
                </TableCell>
                <TableCell
                  className="max-w-48 truncate text-muted-foreground"
                  title={registro.baseLegal}
                >
                  {registro.baseLegal || "—"}
                </TableCell>
                <TableCell className="max-w-40 truncate" title={registro.fonte}>
                  {registro.fonte}
                </TableCell>
                <TableCell
                  className="max-w-48 truncate text-muted-foreground"
                  title={registro.observacoes}
                >
                  {registro.observacoes || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">Ações</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onVisualizar(registro)}>
                        <Eye />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditar(registro)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onExcluir(registro)}
                      >
                        <Trash2 />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {registrosPagina.length === 0 ? 0 : inicio + 1}–
          {inicio + registrosPagina.length} de {registros.length} registros
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={paginaAtual <= 1}
            onClick={() => setPagina(paginaAtual - 1)}
          >
            <ChevronLeft />
          </Button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
