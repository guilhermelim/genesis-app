'use client'

import { toast } from 'sonner'
import type { MemberPageViewModel } from '../_types/member-page.types'
import { listMembersCommand } from '../_commands/member-list.commands'

interface UseMemberListOptions {
  pagination: MemberPageViewModel
  replacePage: (page: MemberPageViewModel) => void
}

export function useMemberList({ pagination, replacePage }: UseMemberListOptions) {
  const changePage = async (page: number) => {
    try {
      replacePage(await listMembersCommand(page, pagination.pageSize))
    } catch (cause) {
      toast.error('Não foi possível carregar os membros', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  const changePageSize = async (pageSize: number) => {
    try {
      replacePage(await listMembersCommand(1, pageSize))
    } catch (cause) {
      toast.error('Não foi possível atualizar a paginação', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  return { changePage, changePageSize }
}
