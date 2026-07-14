"use client"

import Link from "next/link"
import { ArrowRight, Calculator, Database, ShieldCheck, Table2 } from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buscarUFESPAtual, listarTodas } from "@/services/ufespService"
import { formatCurrency, formatDate } from "@/utils/formatters"

export default function DashboardPage() {
  const registros = listarTodas()
  const ufespAtual = buscarUFESPAtual()

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de cálculo de ITCMD."
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>UFESP vigente hoje</CardDescription>
              <CardTitle className="text-2xl">
                {ufespAtual ? formatCurrency(ufespAtual.valor) : "Não cadastrada"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {ufespAtual
                ? `Vigente desde ${formatDate(ufespAtual.dataInicioVigencia)}`
                : "Cadastre um registro vigente na Tabela Histórica UFESP."}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Registros na tabela histórica</CardDescription>
              <CardTitle className="text-2xl">{registros.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Períodos de vigência cadastrados no sistema.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Status</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="size-6 text-primary" />
                MVP
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Uso interno, validação com um único advogado.
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="size-5 text-primary" />
                <CardTitle>Calcular ITCMD</CardTitle>
              </div>
              <CardDescription>
                Informe os dados do processo e do falecimento para apurar o
                valor da guia atualizado pela UFESP.
              </CardDescription>
              <CardAction>
                <Button nativeButton={false} render={<Link href="/calcular" />}>
                  Ir para a calculadora
                  <ArrowRight />
                </Button>
              </CardAction>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Table2 className="size-5 text-primary" />
                <CardTitle>Tabela Histórica UFESP</CardTitle>
              </div>
              <CardDescription>
                Consulte, cadastre e edite os valores históricos de UFESP
                usados pela calculadora.
              </CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/ufesp" />}
                >
                  <Database />
                  Gerenciar tabela
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
