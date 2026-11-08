import { listActivitiesPage } from '@/infrastructure/activity/activity.actions'
import ActivitiesPageClient from './activities-page.client'

type ActivitiesSearchParams = {
  page?: string | string[]
  pageSize?: string | string[]
}

const getPositiveInteger = (
  value: string | string[] | undefined,
  fallback: number,
  maximum = Number.MAX_SAFE_INTEGER,
) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback
}

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<ActivitiesSearchParams> }) {
  const params = await searchParams
  const page = getPositiveInteger(params.page, 1)
  const pageSize = getPositiveInteger(params.pageSize, 10, 100)

  return <ActivitiesPageClient initialPage={await listActivitiesPage({ page, pageSize })} />
}
