'use client'

import * as React from 'react'
import AdminPageCard from '../_components/admin-page-card'
import ActivitySection from './_sections/activity-management.section'
import type { OutputListActivityPageDto } from '@/usecase/activity/list/list.activity.dto'
import type { ActivityPageViewModel } from './_types/activity-page.types'

export default function ActivitiesPageClient({ initialPage }: { initialPage: OutputListActivityPageDto }) {
  const toViewModel = (page: OutputListActivityPageDto): ActivityPageViewModel => ({
    ...page,
    items: page.items.map(item => ({ ...item })),
  })
  return (
    <AdminPageCard title="Atividades" description="Organize as opções disponíveis para voluntariado.">
      <ActivitySection initialPage={toViewModel(initialPage)} />
    </AdminPageCard>
  )
}
