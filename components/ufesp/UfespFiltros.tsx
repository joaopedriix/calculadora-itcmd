"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface UfespFiltrosState {
  ano: string
  mes: string
  data: string
  valor: string
}

export const FILTROS_VAZIOS: UfespFiltrosState = {
  ano: "",
  mes: "",
  data: "",
  valor: "",
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const ITEMS_MES = Object.fromEntries(MESES.map((nome, i) => [String(i + 1), nome]))

interface UfespFiltrosProps {
  filtros: UfespFiltrosState
  onChange: (filtros: UfespFiltrosState) => void
}

export function UfespFiltros({ filtros, onChange }: UfespFiltrosProps) {
  const atualizar = (campo: keyof UfespFiltrosState, valor: string) =>
    onChange({ ...filtros, [campo]: valor })

  const temFiltroAtivo = Object.values(filtros).some(Boolean)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field>
        <FieldLabel htmlFor="filtro-ano">Ano</FieldLabel>
        <Input
          id="filtro-ano"
          type="number"
          placeholder="Ex.: 1992"
          value={filtros.ano}
          onChange={(e) => atualizar("ano", e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="filtro-mes">Mês</FieldLabel>
        <Select
          items={ITEMS_MES}
          value={filtros.mes || null}
          onValueChange={(valor) => atualizar("mes", valor ?? "")}
        >
          <SelectTrigger id="filtro-mes" className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((nome, i) => (
              <SelectItem key={nome} value={String(i + 1)}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="filtro-data">Data</FieldLabel>
        <Input
          id="filtro-data"
          type="date"
          value={filtros.data}
          onChange={(e) => atualizar("data", e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="filtro-valor">Valor</FieldLabel>
        <Input
          id="filtro-valor"
          type="number"
          step="0.01"
          placeholder="Ex.: 12.34"
          value={filtros.valor}
          onChange={(e) => atualizar("valor", e.target.value)}
        />
      </Field>

      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Button
          type="button"
          variant="outline"
          disabled={!temFiltroAtivo}
          onClick={() => onChange(FILTROS_VAZIOS)}
        >
          <X />
          Limpar filtros
        </Button>
      </div>
    </div>
  )
}
