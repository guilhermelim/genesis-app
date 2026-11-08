'use client'

import React, { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { type ActivityListItemSchemaType } from './activity-list.component.schema'
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
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import { getActivityIcon } from '@/lib/activity-icons'
import ActivityForm from '../_forms/activity.form/activity.form'
import type { ActivityFormValues } from '../_forms/activity.form/activity.schema'
import ActivityDeleteDialog from './activity-delete-dialog.component'
import { PaginationControls } from '@/components/ui/pagination-controls'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ActivityListComponent({
  activities,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onUpdate,
  onDelete,
}: {
  activities: ActivityListItemSchemaType[]
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void | Promise<void>
  onPageSizeChange: (pageSize: number) => void | Promise<void>
  onUpdate: (data: ActivityListItemSchemaType) => void
  onDelete: (id: string) => void
}) {
  const [editingActivity, setEditingActivity] = useState<ActivityListItemSchemaType>()
  const [pendingUpdate, setPendingUpdate] = useState<ActivityListItemSchemaType>()
  const [pendingDelete, setPendingDelete] = useState<ActivityListItemSchemaType>()
  const sorted = useMemo(
    () =>
      [...activities].sort(
        (a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }) || a.id.localeCompare(b.id),
      ),
    [activities],
  )
  const beginEdit = (activity: ActivityListItemSchemaType) => {
    setEditingActivity(activity)
  }
  const confirmUpdate = () => {
    onUpdate(pendingUpdate!)
    setPendingUpdate(undefined)
    setEditingActivity(undefined)
  }
  const confirmDelete = () => {
    onDelete(pendingDelete!.id)
    setPendingDelete(undefined)
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {!sorted.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma atividade cadastrada.</div>
        )}
        {sorted.map(activity => {
          const Icon = getActivityIcon(activity.iconName)
          return (
            <div key={activity.id} className="rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-primary">{activity.label}</span>
                    <span className="text-xs text-muted-foreground">Atividade</span>
                  </div>
                  <p className="mt-1 break-words font-medium">{activity.name}</p>
                  <div className="mt-2 line-clamp-2 max-h-10 overflow-hidden text-sm text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:break-words [&_p]:whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-4">
                    <ReactMarkdown>{activity.description}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t pt-3">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => beginEdit(activity)}>
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => setPendingDelete(activity)}>
                  <Trash2 className="size-4" /> Excluir
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-28">Prefixo</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead className="hidden lg:table-cell">Descrição</TableHead>
              <TableHead className="w-52 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(activity => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {(() => {
                    const Icon = getActivityIcon(activity.iconName)
                    return <Icon className="mr-2 inline size-4 text-primary" />
                  })()}
                  {activity.label}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{activity.name}</p>
                  <div className="mt-1 line-clamp-2 max-h-8 overflow-hidden text-xs text-muted-foreground md:hidden [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:break-words [&_p]:whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-4">
                    <ReactMarkdown>{activity.description}</ReactMarkdown>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-0 text-muted-foreground lg:table-cell">
                  <div className="min-w-0 overflow-hidden break-words text-ellipsis line-clamp-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown>{activity.description}</ReactMarkdown>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                      onClick={() => beginEdit(activity)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="hidden lg:inline">Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="size-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                      onClick={() => setPendingDelete(activity)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden lg:inline">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!sorted.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma atividade cadastrada.</div>
        )}
      </div>
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        itemLabel="atividades"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
      <Dialog open={Boolean(editingActivity)} onOpenChange={open => !open && setEditingActivity(undefined)}>
        <DialogContent className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar atividade</DialogTitle>
            <DialogDescription>Atualize o prefixo, nome, descrição e ícone da atividade.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            {editingActivity && (
              <ActivityForm
                initialValues={{
                  ...editingActivity,
                  iconName: editingActivity.iconName as ActivityFormValues['iconName'],
                }}
                resetAfterSubmit={false}
                embedded
                formId="edit-activity-form"
                onSubmit={data => setPendingUpdate({ ...data, id: editingActivity.id } as ActivityListItemSchemaType)}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingActivity(undefined)}>
              Cancelar
            </Button>
            <Button type="submit" form="edit-activity-form">
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingUpdate)} onOpenChange={open => !open && setPendingUpdate(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar edição</AlertDialogTitle>
            <AlertDialogDescription>
              Salvar as alterações de {pendingUpdate?.name}? O prefixo, nome e descrição serão atualizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate}>Salvar alterações</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ActivityDeleteDialog
        activityName={pendingDelete?.name}
        open={Boolean(pendingDelete)}
        onOpenChange={open => !open && setPendingDelete(undefined)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
