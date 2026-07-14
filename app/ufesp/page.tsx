"use client"

import { useMemo, useState } from "react"
import { Download, FileSpreadsheet, Plus, Upload } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FILTROS_VAZIOS,
  UfespFiltros,
  type UfespFiltrosState,
} from "@/components/ufesp/UfespFiltros"
import {
  UfespFormDialog,
  type UfespFormMode,
} from "@/components/ufesp/UfespFormDialog"
import { UfespDeleteDialog } from "@/components/ufesp/UfespDeleteDialog"
import { UfespTable } from "@/components/ufesp/UfespTable"
import type { UfespFormValues } from "@/lib/validations"
import {
  adicionar,
  buscarPorAno,
  editar,
  importarTabelaUFESP,
  listarTodas,
  remover,
} from "@/services/ufespService"
import { exportarCSV, exportarExcel } from "@/utils/exportUfesp"
import type { UfespRecord } from "@/types"

export default function TabelaUfespPage() {
  const [registros, setRegistros] = useState<UfespRecord[]>(() => listarTodas())
  const [filtros, setFiltros] = useState<UfespFiltrosState>(FILTROS_VAZIOS)

  const [formDialog, setFormDialog] = useState<{
    open: boolean
    mode: UfespFormMode
    registro?: UfespRecord
  }>({ open: false, mode: "criar" })

  const [exclusao, setExclusao] = useState<{
    open: boolean
    registro?: UfespRecord
  }>({ open: false })

  function atualizarRegistros() {
    setRegistros(listarTodas())
  }

  const registrosFiltrados = useMemo(() => {
    let lista = filtros.ano ? buscarPorAno(Number(filtros.ano)) : registros

    if (filtros.mes) {
      lista = lista.filter((registro) => registro.mes === Number(filtros.mes))
    }

    if (filtros.valor) {
      const alvoCentavos = Math.round(Number(filtros.valor) * 100)
      lista = lista.filter(
        (registro) => Math.round(registro.valor * 100) === alvoCentavos
      )
    }

    if (filtros.data) {
      const data = new Date(`${filtros.data}T00:00:00`)
      lista = lista.filter((registro) => {
        const vigenteAte = registro.dataFimVigencia
        return (
          registro.dataInicioVigencia <= data &&
          (vigenteAte === null || vigenteAte >= data)
        )
      })
    }

    return lista
  }, [registros, filtros])

  function abrirNovo() {
    setFormDialog({ open: true, mode: "criar", registro: undefined })
  }

  function abrirEditar(registro: UfespRecord) {
    setFormDialog({ open: true, mode: "editar", registro })
  }

  function abrirVisualizar(registro: UfespRecord) {
    setFormDialog({ open: true, mode: "visualizar", registro })
  }

  function salvar(dados: UfespFormValues) {
    if (formDialog.mode === "editar" && formDialog.registro) {
      editar(formDialog.registro.id, dados)
      toast.success("Registro de UFESP atualizado.")
    } else {
      adicionar(dados)
      toast.success("Registro de UFESP criado.")
    }

    atualizarRegistros()
    setFormDialog({ open: false, mode: "criar" })
  }

  function confirmarExclusao() {
    if (exclusao.registro) {
      remover(exclusao.registro.id)
      atualizarRegistros()
      toast.success("Registro de UFESP excluído.")
    }
    setExclusao({ open: false })
  }

  async function importarBase() {
    try {
      await importarTabelaUFESP()
    } catch {
      toast.info("Importação automática ainda não implementada nesta versão.")
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Tabela Histórica UFESP"
        description="Cadastro e manutenção dos valores históricos de UFESP."
        actions={
          <Button onClick={abrirNovo}>
            <Plus />
            Nova UFESP
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Refine a lista por ano, mês, data de vigência ou valor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UfespFiltros filtros={filtros} onChange={setFiltros} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Registros</CardTitle>
                <CardDescription>
                  Toda consulta e alteração passa por{" "}
                  <code className="text-xs">services/ufespService.ts</code>.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={importarBase}>
                  <Upload />
                  Importar Base
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportarCSV(registros)}
                >
                  <Download />
                  Exportar CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportarExcel(registros)}
                >
                  <FileSpreadsheet />
                  Exportar Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <UfespTable
              registros={registrosFiltrados}
              onVisualizar={abrirVisualizar}
              onEditar={abrirEditar}
              onExcluir={(registro) => setExclusao({ open: true, registro })}
            />
          </CardContent>
        </Card>
      </main>

      <UfespFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        registro={formDialog.registro}
        onOpenChange={(open) => setFormDialog((atual) => ({ ...atual, open }))}
        onSalvar={salvar}
      />

      <UfespDeleteDialog
        open={exclusao.open}
        onOpenChange={(open) => setExclusao((atual) => ({ ...atual, open }))}
        onConfirmar={confirmarExclusao}
      />
    </div>
  )
}
