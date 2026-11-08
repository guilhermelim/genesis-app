'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PaginationControls } from '@/components/ui/pagination-controls'
import PollExpirationBadge from '@/components/poll-expiration-badge'
import PollForm from '../_forms/poll.form/poll.form'
import PollSettingsForm from '../_forms/poll-settings.form/poll-settings.form'
import type { PollFormValues } from '../_forms/poll.form/poll.schema'
import type { PollSettings } from '@/app/_shared/poll/types/poll-view-model.types'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import { getNextPollExpiration } from '@/app/_shared/poll/lib/poll-view-model'
import { isPollExpired } from '@/app/_shared/poll/lib/poll-availability'
import { ImageOff, Plus, Save, Settings2, Vote } from 'lucide-react'

export default function PollHistory({
  polls,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  settings,
  selectedPollId,
  onSelect,
  onCreate,
  onActivate,
  onDelete,
  onUpdateSettings,
}: {
  polls: PollViewModel[]
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number, pageSize: number) => void | Promise<void>
  onPageSizeChange: (pageSize: number) => void | Promise<void>
  settings: PollSettings
  selectedPollId?: string
  onSelect: (id: string) => void
  onCreate: (input: PollFormValues) => Promise<void>
  onActivate: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpdateSettings: (input: PollSettings) => Promise<void>
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PollViewModel>()
  const expiresAt = useMemo(() => getNextPollExpiration(settings), [settings])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Histórico de voluntariados</h2>
          <p className="text-sm text-muted-foreground">Cada voluntariado preserva suas inscrições e fotos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="size-4" />
                  Definir vencimento padrão
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Vencimento padrão</DialogTitle>
                <DialogDescription>
                  Defina o dia e o horário usados automaticamente em novos voluntariados.
                </DialogDescription>
              </DialogHeader>
              <PollSettingsForm
                initialValues={settings}
                onSubmit={async value => {
                  await onUpdateSettings(value)
                  setSettingsOpen(false)
                }}
                onCancel={() => setSettingsOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-2">
                  <Plus className="size-4" />
                  Novo voluntariado
                </Button>
              }
            />
            <DialogContent className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Novo voluntariado</DialogTitle>
                <DialogDescription>Preencha os dados e adicione as fotos do novo voluntariado.</DialogDescription>
              </DialogHeader>
              <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
                {createOpen && (
                  <PollForm
                    defaultExpiresAt={expiresAt}
                    submitLabel="Criar voluntariado"
                    formId="create-poll-form"
                    embedded
                    onSubmit={async data => {
                      await onCreate(data)
                      setCreateOpen(false)
                    }}
                  />
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" form="create-poll-form" className="gap-2">
                  <Save className="size-4" />
                  Criar enquete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="space-y-3">
        {polls.map(item => {
          const primaryPhoto = item.photos.find(photo => photo.isPrimary)
          const selected = selectedPollId === item.id
          return (
            <Card
              key={item.id}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => onSelect(item.id)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(item.id)
                }
              }}
              className={`cursor-pointer overflow-hidden transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 ${selected ? 'border-primary bg-primary/[0.03] ring-2 ring-primary/20' : ''}`}
            >
              <CardHeader className="p-4 pb-0">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 break-words">
                    <div className="mb-2 flex items-center gap-2 text-sm text-primary">
                      <Vote className="size-4" />
                      {item.name}
                    </div>
                    <CardTitle className="text-xl break-words">{item.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{item.description}</CardDescription>
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                    <Badge variant={item.active ? 'default' : 'outline'}>{item.active ? 'Ativa' : 'Encerrada'}</Badge>
                    <PollExpirationBadge expiresAt={item.expiresAt} active={item.active} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  {primaryPhoto ? (
                    <Image
                      width={64}
                      height={64}
                      className="size-16 shrink-0 rounded-md object-cover"
                      src={primaryPhoto.dataUrl}
                      alt=""
                      unoptimized
                    />
                  ) : (
                    <span
                      className="grid size-16 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"
                      aria-label="Voluntariado sem imagem de destaque"
                    >
                      <ImageOff className="size-6" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Participação</p>
                    <p className="font-medium">
                      {item.votes.length} {item.votes.length === 1 ? 'inscrição registrada' : 'inscrições registradas'}
                    </p>
                  </div>
                </div>
                <div
                  className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end"
                  onClick={event => event.stopPropagation()}
                >
                  {item.active ? (
                    <Badge variant="default">Inscrições abertas</Badge>
                  ) : (
                    !isPollExpired(item.expiresAt) && (
                      <Button variant="outline" size="sm" onClick={() => void onActivate(item.id)}>
                        Ativar
                      </Button>
                    )
                  )}
                  <Button variant="destructive" size="sm" onClick={() => setPendingDelete(item)}>
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        itemLabel="voluntariados"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={open => !open && setPendingDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir voluntariado?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir o voluntariado “{pendingDelete?.title}”. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) void onDelete(pendingDelete.id)
                setPendingDelete(undefined)
              }}
            >
              Excluir voluntariado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
