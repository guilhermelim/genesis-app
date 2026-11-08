'use client'

import { useMemo, useState } from 'react'
import type { MemberListItemSchemaType } from './member-list.component.schema'
import MemberForm from '../_forms/member.form/member.form'
import type { MemberFormValues } from '../_forms/member.form/member.schema'
import MemberDeleteDialog from './member-delete-dialog.component'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CircleCheck, CircleX, Pencil, Trash2 } from 'lucide-react'
import { PaginationControls } from '@/components/ui/pagination-controls'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function MemberListComponent({
  members,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onUpdate,
  onDelete,
}: {
  members: MemberListItemSchemaType[]
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => Promise<void>
  onPageSizeChange: (pageSize: number) => Promise<void>
  onUpdate: (data: MemberListItemSchemaType) => void
  onDelete: (id: string) => void
}) {
  const [editingMember, setEditingMember] = useState<MemberListItemSchemaType>()
  const [pendingUpdate, setPendingUpdate] = useState<MemberListItemSchemaType>()
  const [pendingDelete, setPendingDelete] = useState<MemberListItemSchemaType>()
  const sorted = useMemo(
    () =>
      [...members].sort(
        (a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }) || a.id.localeCompare(b.id),
      ),
    [members],
  )
  const beginEdit = (member: MemberListItemSchemaType) => {
    setEditingMember(member)
  }
  const confirmUpdate = () => {
    onUpdate(pendingUpdate!)
    setPendingUpdate(undefined)
    setEditingMember(undefined)
  }
  const confirmDelete = () => {
    onDelete(pendingDelete!.id)
    setPendingDelete(undefined)
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {!sorted.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum membro cadastrado.</div>
        )}
        {sorted.map(member => (
          <div key={member.id} className="rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg" className="shrink-0">
                <AvatarImage src={member.image} alt="" />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">Participante da votação</p>
                <Badge variant="outline" className="mt-2 px-1.5">
                  {member.active ? <CircleCheck className="text-green-500 dark:text-green-400" /> : <CircleX />}
                  {member.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex gap-2 border-t pt-3">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => beginEdit(member)}>
                <Pencil className="size-4" /> Editar
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => setPendingDelete(member)}>
                <Trash2 className="size-4" /> Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Membro</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-52 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(member => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage src={member.image} alt="" />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">Participante da votação</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="px-1.5">
                    {member.active ? (
                      <CircleCheck className="text-green-500 dark:text-green-400" />
                    ) : (
                      <CircleX className="text-muted-foreground" />
                    )}
                    {member.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                      onClick={() => beginEdit(member)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="hidden md:inline">Editar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="size-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                      onClick={() => setPendingDelete(member)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden md:inline">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!sorted.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum membro cadastrado.</div>
        )}
      </div>
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemLabel="membros"
      />
      <Dialog open={Boolean(editingMember)} onOpenChange={open => !open && setEditingMember(undefined)}>
        <DialogContent className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar membro</DialogTitle>
            <DialogDescription>Atualize o nome, a foto e o status do membro.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            {editingMember && (
              <MemberForm
                initialValues={editingMember}
                onSubmit={(data: MemberFormValues) =>
                  setPendingUpdate({ ...data, id: editingMember.id } as MemberListItemSchemaType)
                }
                embedded
                formId="edit-member-form"
                resetAfterSubmit={false}
                submitLabel="Salvar alterações"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(undefined)}>
              Cancelar
            </Button>
            <Button type="submit" form="edit-member-form">
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
              Salvar as alterações de {pendingUpdate?.name}? A foto e o nome serão atualizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate}>Salvar alterações</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <MemberDeleteDialog
        memberName={pendingDelete?.name}
        open={Boolean(pendingDelete)}
        onOpenChange={open => !open && setPendingDelete(undefined)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
