'use client'

import AdminPageCard from '../_components/admin-page-card'
import MemberSection from './_sections/member-management.section'
import type { OutputListMemberPageDto } from '@/usecase/member/list/list.member.dto'
import type { MemberPageViewModel } from './_types/member-page.types'

export default function MembersPageClient({ initialPage }: { initialPage: OutputListMemberPageDto }) {
  const toViewModel = (page: OutputListMemberPageDto): MemberPageViewModel => ({
    ...page,
    items: page.items.map(item => ({ ...item })),
  })
  return (
    <AdminPageCard title="Membros" description="Cadastre e mantenha os participantes atualizados.">
      <MemberSection initialPage={toViewModel(initialPage)} />
    </AdminPageCard>
  )
}
