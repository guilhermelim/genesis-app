import { listActivitiesPage } from '@/infrastructure/activity/activity.actions'

export function listActivitiesCommand(page: number, pageSize: number): ReturnType<typeof listActivitiesPage> {
  return listActivitiesPage({ page, pageSize })
}
