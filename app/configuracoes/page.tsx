import { Building2, KeyRound, Users } from "lucide-react"

import { PageHeader } from "@/components/layout/PageHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FUTURAS_CONFIGURACOES = [
  {
    icon: Users,
    title: "Usuários e permissões",
    description: "Cadastro de advogados do escritório e controle de acesso.",
  },
  {
    icon: Building2,
    title: "Clientes e processos",
    description: "Cadastro de clientes e vinculação com processos e cálculos.",
  },
  {
    icon: KeyRound,
    title: "Login e autenticação",
    description: "Autenticação por escritório, preparando o sistema para SaaS.",
  },
]

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Configurações"
        description="Preferências gerais do sistema."
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Em desenvolvimento</CardTitle>
            <CardDescription>
              Nesta primeira versão não há configurações ajustáveis. A tela já
              está reservada no menu para as próximas evoluções do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {FUTURAS_CONFIGURACOES.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-2 rounded-lg border p-4"
                >
                  <item.icon className="size-5 text-primary" />
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
