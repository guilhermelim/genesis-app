'use client'

import { toast } from 'sonner'
import type { ActivityPageViewModel } from '../_types/activity-page.types'
import { listActivitiesCommand } from '../_commands/activity-list.commands'

interface UseActivityListOptions {
  pagination: ActivityPageViewModel
  replacePage: (page: ActivityPageViewModel) => void
}

export function useActivityList({ pagination, replacePage }: UseActivityListOptions) {
  const changePage = async (page: number) => {
    try {
      replacePage(await listActivitiesCommand(page, pagination.pageSize))
    } catch (cause) {
      toast.error('Não foi possível carregar as atividades', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  const changePageSize = async (pageSize: number) => {
    try {
      replacePage(await listActivitiesCommand(1, pageSize))
    } catch (cause) {
      toast.error('Não foi possível atualizar a paginação', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  return { changePage, changePageSize }
}
