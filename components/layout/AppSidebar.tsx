"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, LayoutDashboard, Scale, Settings, Table2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calcular", label: "Calcular ITCMD", icon: Calculator },
  { href: "/ufesp", label: "Tabela Histórica UFESP", icon: Table2 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="size-4 text-primary" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading font-semibold">
                  ITCMD SP
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Calculadora jurídica
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          MVP — uso interno
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
