'use client'
import React from 'react'
import MemberForm from '../_forms/member.form/member.form'
import MemberListComponent from '../_components/member-list.component'
import type { MemberPageViewModel } from '../_types/member-page.types'
import { useMemberState } from '../_hooks/use-member-state'
import { useMemberList } from '../_hooks/use-member-list'
import { useMemberActions } from '../_hooks/use-member-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Plus, UserPlus, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function MemberSection({ initialPage }: { initialPage: MemberPageViewModel }) {
  const state = useMemberState({ initialPage })
  const list = useMemberList({
    pagination: state.pagination,
    replacePage: state.replacePage,
  })
  const actions = useMemberActions({
    members: state.members,
    pagination: state.pagination,
    replacePage: state.replacePage,
    replaceMember: state.replaceMember,
    removeMember: state.removeMember,
    closeCreate: () => state.setIsCreateOpen(false),
  })
  const { members, pagination, isCreateOpen, setIsCreateOpen } = state
  return (
    <section className="w-full min-w-0 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{pagination.totalItems}</p>
              <p className="text-xs text-primary-foreground/75">Membros cadastrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <Camera className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-2xl font-bold">{members.filter(member => member.image).length}</p>
              <p className="text-xs text-muted-foreground">Com foto</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <UserPlus className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold">Cadastro rápido</p>
              <p className="text-xs text-muted-foreground">Nome e foto opcional</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Lista de membros</CardTitle>
              <CardDescription className="mt-1">Ordenados alfabeticamente.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {pagination.totalItems} total
              </span>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" />
                Adicionar membro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MemberListComponent
            members={members}
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={list.changePage}
            onPageSizeChange={list.changePageSize}
            onUpdate={actions.update}
            onDelete={actions.remove}
          />
        </CardContent>
      </Card>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="flex max-h-[90vh] min-h-0 flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar novo membro</DialogTitle>
            <DialogDescription>Inclua o nome e, se quiser, uma foto para facilitar a votação.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            {isCreateOpen && <MemberForm onSubmit={actions.create} embedded formId="create-member-form" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="create-member-form">
              Adicionar membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
