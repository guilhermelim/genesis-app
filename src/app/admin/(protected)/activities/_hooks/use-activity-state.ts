'use client'

import { useState } from 'react'
import type { ActivityListItemSchemaType } from '../_components/activity-list.component.schema'
import type { ActivityPageViewModel } from '../_types/activity-page.types'

export function useActivityState({ initialPage }: { initialPage: ActivityPageViewModel }) {
  const [activities, setActivities] = useState(initialPage.items)
  const [pagination, setPagination] = useState(initialPage)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const replacePage = (page: ActivityPageViewModel) => {
    setActivities(page.items)
    setPagination(page)
  }

  const replaceActivity = (activity: ActivityListItemSchemaType) => {
    setActivities(current => current.map(item => (item.id === activity.id ? activity : item)))
  }

  const removeActivity = (id: string) => {
    setActivities(current => current.filter(item => item.id !== id))
    setPagination(current => ({
      ...current,
      totalItems: Math.max(0, current.totalItems - 1),
      totalPages: Math.max(1, Math.ceil(Math.max(0, current.totalItems - 1) / current.pageSize)),
    }))
  }

  return {
    activities,
    pagination,
    isCreateOpen,
    setIsCreateOpen,
    replacePage,
    replaceActivity,
    removeActivity,
  }
}
