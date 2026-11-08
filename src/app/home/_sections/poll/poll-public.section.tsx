'use client'
import VotingForm from '@/app/_shared/poll/forms/voting.form/voting.form'
import PollResultsComponent from '@/app/_shared/poll/components/poll-results.component'
import type { PollViewModel as PollData } from '@/app/_shared/poll/types/poll-view-model.types'
export default function PollPublicSection({
  poll,
  members,
  activities,
  onVote,
  onRefresh,
}: {
  poll: PollData
  members: { id: string; name: string; image?: string; active: boolean }[]
  activities: { id: string; name: string; label: string; iconName?: string }[]
  onVote: (memberId: string, activityId: string) => void
  onRefresh: () => void
}) {
  return (
    <div className="w-full min-w-0 space-y-8">
      <VotingForm
        poll={poll}
        members={members}
        activities={activities}
        onSubmit={({ memberId, activityId }) => onVote(memberId, activityId)}
        onRefresh={onRefresh}
      />
      <PollResultsComponent poll={poll} members={members} activities={activities} showHeader={false} />
    </div>
  )
}
