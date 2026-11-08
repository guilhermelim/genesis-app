'use client'

import { useState } from 'react'
import type { MemberListItemSchemaType } from '../_components/member-list.component.schema'
import type { MemberPageViewModel } from '../_types/member-page.types'

export function useMemberState({ initialPage }: { initialPage: MemberPageViewModel }) {
  const [members, setMembers] = useState(initialPage.items)
  const [pagination, setPagination] = useState(initialPage)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const replacePage = (page: MemberPageViewModel) => {
    setMembers(page.items)
    setPagination(page)
  }

  const replaceMember = (member: MemberListItemSchemaType) => {
    setMembers(current => current.map(item => (item.id === member.id ? member : item)))
  }

  const removeMember = (id: string) => {
    setMembers(current => current.filter(item => item.id !== id))
    setPagination(current => ({
      ...current,
      totalItems: Math.max(0, current.totalItems - 1),
      totalPages: Math.max(1, Math.ceil(Math.max(0, current.totalItems - 1) / current.pageSize)),
    }))
  }

  return {
    members,
    pagination,
    isCreateOpen,
    setIsCreateOpen,
    replacePage,
    replaceMember,
    removeMember,
  }
}
