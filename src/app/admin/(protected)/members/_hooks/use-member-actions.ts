'use client'

import { toast } from 'sonner'
import { createMemberCommand, deleteMemberCommand, updateMemberCommand } from '../_commands/member-actions.commands'
import { listMembersCommand } from '../_commands/member-list.commands'
import type { MemberFormValues } from '../_forms/member.form/member.schema'
import type { MemberListItemSchemaType } from '../_components/member-list.component.schema'
import type { MemberPageViewModel } from '../_types/member-page.types'

interface UseMemberActionsOptions {
  members: MemberListItemSchemaType[]
  pagination: MemberPageViewModel
  replacePage: (page: MemberPageViewModel) => void
  replaceMember: (member: MemberListItemSchemaType) => void
  removeMember: (id: string) => void
  closeCreate: () => void
}

export function useMemberActions({
  members,
  pagination,
  replacePage,
  replaceMember,
  removeMember,
  closeCreate,
}: UseMemberActionsOptions) {
  const create = async (data: MemberFormValues) => {
    try {
      await createMemberCommand(data)
      replacePage(await listMembersCommand(pagination.page, pagination.pageSize))
      closeCreate()
      toast.success('Membro criado', { description: 'O membro foi adicionado com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível criar o membro', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
    }
  }

  const update = async (data: MemberListItemSchemaType) => {
    try {
      await updateMemberCommand(data)
      replaceMember(data)
      toast.success('Membro atualizado', { description: 'As alterações foram salvas com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível atualizar o membro', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteMemberCommand(id)
      const remaining = members.filter(item => item.id !== id)
      if (!remaining.length && pagination.page > 1) {
        replacePage(await listMembersCommand(pagination.page - 1, pagination.pageSize))
      } else {
        removeMember(id)
      }
      toast.success('Membro excluído', { description: 'O membro foi removido com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível excluir o membro', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
    }
  }

  return { create, update, remove }
}
