import PageContainer from '@/components/layout/page-container'
import PollClient from './_sections/home/poll-client'
import HomeHero from './_components/home-hero'
import { getActivePoll } from '@/infrastructure/poll/poll.actions'
import { listActivities } from '@/infrastructure/activity/activity.actions'
import { listMembers } from '@/infrastructure/member/member.actions'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [poll, activities, allMembers] = await Promise.all([getActivePoll(), listActivities(), listMembers()])
  const members = allMembers.filter(member => member.active)
  return (
    <PageContainer className="space-y-10">
      <HomeHero memberCount={members.length} photos={poll?.photos} pollTitle={poll?.title} />
      <PollClient poll={poll} members={members} activities={activities} />
    </PageContainer>
  )
}
