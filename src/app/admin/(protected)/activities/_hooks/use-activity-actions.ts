'use client'

import { toast } from 'sonner'
import {
  createActivityCommand,
  deleteActivityCommand,
  updateActivityCommand,
} from '../_commands/activity-actions.commands'
import { listActivitiesCommand } from '../_commands/activity-list.commands'
import type { ActivityFormValues } from '../_forms/activity.form/activity.schema'
import type { ActivityListItemSchemaType } from '../_components/activity-list.component.schema'
import type { ActivityPageViewModel } from '../_types/activity-page.types'

interface UseActivityActionsOptions {
  activities: ActivityListItemSchemaType[]
  pagination: ActivityPageViewModel
  replacePage: (page: ActivityPageViewModel) => void
  replaceActivity: (activity: ActivityListItemSchemaType) => void
  removeActivity: (id: string) => void
  closeCreate: () => void
}

export function useActivityActions({
  activities,
  pagination,
  replacePage,
  replaceActivity,
  removeActivity,
  closeCreate,
}: UseActivityActionsOptions) {
  const create = async (data: ActivityFormValues) => {
    try {
      await createActivityCommand(data)
      replacePage(await listActivitiesCommand(pagination.page, pagination.pageSize))
      closeCreate()
      toast.success('Atividade criada', { description: 'A atividade foi adicionada com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível criar a atividade', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
    }
  }

  const update = async (data: ActivityListItemSchemaType) => {
    try {
      await updateActivityCommand(data)
      replaceActivity(data)
      toast.success('Atividade atualizada', { description: 'As alterações foram salvas com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível atualizar a atividade', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteActivityCommand(id)
      const remaining = activities.filter(item => item.id !== id)
      if (!remaining.length && pagination.page > 1) {
        replacePage(await listActivitiesCommand(pagination.page - 1, pagination.pageSize))
      } else {
        removeActivity(id)
      }
      toast.success('Atividade removida', { description: 'A atividade foi removida com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível remover a atividade', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
    }
  }

  return { create, update, remove }
}
