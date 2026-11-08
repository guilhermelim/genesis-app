import { listPollsPage } from '@/infrastructure/poll/poll.actions'
import { getPollSettings } from '@/infrastructure/poll-settings/poll-settings.actions'
import { listActivities } from '@/infrastructure/activity/activity.actions'
import { listMembers } from '@/infrastructure/member/member.actions'
import PollPageClient from './poll-page.client'

type PollSearchParams = { page?: string | string[]; pageSize?: string | string[] }

const getPositiveInteger = (
  value: string | string[] | undefined,
  fallback: number,
  maximum = Number.MAX_SAFE_INTEGER,
) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback
}

export default async function PollPage({ searchParams }: { searchParams: Promise<PollSearchParams> }) {
  const params = await searchParams
  const page = getPositiveInteger(params.page, 1)
  const pageSize = getPositiveInteger(params.pageSize, 10, 100)
  const [polls, settings, activities, members] = await Promise.all([
    listPollsPage({ page, pageSize }),
    getPollSettings(),
    listActivities(),
    listMembers(),
  ])
  return <PollPageClient initialPage={polls} settings={settings} activities={activities} members={members} />
}
