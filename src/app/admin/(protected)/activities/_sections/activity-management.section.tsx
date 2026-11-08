'use client'
import React from 'react'
import ActivityForm from '../_forms/activity.form/activity.form'
import ActivityListComponent from '../_components/activity-list.component'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, ListChecks, Plus } from 'lucide-react'
import type { ActivityPageViewModel } from '../_types/activity-page.types'
import { useActivityState } from '../_hooks/use-activity-state'
import { useActivityList } from '../_hooks/use-activity-list'
import { useActivityActions } from '../_hooks/use-activity-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ActivitySection({ initialPage }: { initialPage: ActivityPageViewModel }) {
  const state = useActivityState({ initialPage })
  const list = useActivityList({
    pagination: state.pagination,
    replacePage: state.replacePage,
  })
  const actions = useActivityActions({
    activities: state.activities,
    pagination: state.pagination,
    replacePage: state.replacePage,
    replaceActivity: state.replaceActivity,
    removeActivity: state.removeActivity,
    closeCreate: () => state.setIsCreateOpen(false),
  })
  const { activities, pagination, isCreateOpen, setIsCreateOpen } = state
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15">
              <ListChecks className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{pagination.totalItems}</p>
              <p className="text-xs text-primary-foreground/75">Atividades cadastradas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <ClipboardList className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-2xl font-bold">{activities.filter(activity => activity.description).length}</p>
              <p className="text-xs text-muted-foreground">Com descrição</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <Plus className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold">Cadastro rápido</p>
              <p className="text-xs text-muted-foreground">Nome, prefixo e descrição</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Lista de atividades</CardTitle>
              <CardDescription className="mt-1">Revise ou remova opções existentes.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {pagination.totalItems} total
              </span>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" />
                Adicionar atividade
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityListComponent
            activities={activities}
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
            <DialogTitle>Adicionar nova atividade</DialogTitle>
            <DialogDescription>Crie uma opção clara e atrativa para a enquete.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            {isCreateOpen && <ActivityForm onSubmit={actions.create} embedded formId="create-activity-form" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="create-activity-form">
              Adicionar atividade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
