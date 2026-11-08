'use client'
import { useState } from 'react'
import type { PollData, PollFormValues } from '../_forms/poll.form/poll.schema'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import PollForm from '../_forms/poll.form/poll.form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Save } from 'lucide-react'

export default function PollManagementComponent({
  poll,
  onUpdate,
  onClearVotes,
  open = true,
  onClose = () => undefined,
}: {
  poll: PollData
  onUpdate: (data: PollFormValues) => void
  onClearVotes: () => void
  open?: boolean
  onClose?: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const submit = (data: PollFormValues) => {
    onUpdate(data)
  }
  return (
    <Dialog open={open} onOpenChange={value => !value && onClose()}>
      <DialogContent className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar voluntariado</DialogTitle>
          <DialogDescription>Atualize os dados, o vencimento e as fotos deste voluntariado.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <PollForm
            key={`${poll.id}-${poll.updatedAt}`}
            poll={poll}
            submitLabel="Salvar alterações"
            formId="edit-poll-form"
            embedded
            onSubmit={submit}
          />
          <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-destructive">Inscrições deste voluntariado</p>
              <p className="mt-1 text-sm text-muted-foreground">Limpe somente as inscrições deste voluntariado.</p>
            </div>
            <Button
              className="w-full shrink-0 sm:w-auto"
              disabled={!poll.votes.length}
              onClick={() => setConfirm(true)}
              variant="destructive"
            >
              <Trash2 className="size-4" /> Limpar inscrições
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-poll-form" className="gap-2">
            <Save className="size-4" />
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar limpeza</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja limpar todas as inscrições? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onClearVotes()
                setConfirm(false)
              }}
            >
              Limpar inscrições
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
