import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calculadora de ITCMD por UFESP",
  description:
    "Cálculo de ITCMD de óbitos antigos do Estado de São Paulo por atualização via UFESP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-muted/30">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="print:!m-0 print:!shadow-none">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  );
}
