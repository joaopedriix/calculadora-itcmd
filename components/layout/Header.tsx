import { Scale } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-card print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Scale className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-semibold leading-tight">
            Calculadora de ITCMD por UFESP
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualização de patrimônio e apuração de guia para óbitos antigos — Estado de São Paulo
          </p>
        </div>
      </div>
    </header>
  )
}
