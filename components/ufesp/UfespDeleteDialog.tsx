"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UfespDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmar: () => void
}

export function UfespDeleteDialog({
  open,
  onOpenChange,
  onConfirmar,
}: UfespDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir registro de UFESP?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este registro? Essa ação não pode
            ser desfeita e pode afetar cálculos que dependam deste período de
            vigência.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirmar}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
