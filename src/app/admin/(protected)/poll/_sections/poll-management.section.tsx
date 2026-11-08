'use client'
import { Card, CardContent } from '@/components/ui/card'
import VotingForm from '@/app/_shared/poll/forms/voting.form/voting.form'
import PollResultsComponent from '@/app/_shared/poll/components/poll-results.component'
import PollOverview from '../_components/poll-overview.component'
import type { PollViewModel as PollData } from '@/app/_shared/poll/types/poll-view-model.types'
import { ClipboardList, Users, Vote } from 'lucide-react'

import { isPollAvailable } from '@/app/_shared/poll/lib/poll-availability'

export default function PollManagementSection({
  poll,
  members,
  activities,
  onVote,
  onRefresh,
  mode,
}: {
  poll: PollData
  members: import('@/app/_shared/poll/types/poll-member.types').PollMember[]
  activities: import('@/app/_shared/poll/types/poll-activity.types').PollActivity[]
  onVote: (memberId: string, activityId: string) => void
  onRefresh: () => void
  mode: 'vote' | 'results' | 'edit'
}) {
  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15">
              <Vote className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold">{poll.votes.length}</p>
              <p className="text-xs text-primary-foreground/75">Votos registrados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <Users className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-xs text-muted-foreground">Membros disponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary">
              <ClipboardList className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-2xl font-bold">{activities.length}</p>
              <p className="text-xs text-muted-foreground">Atividades disponíveis</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {mode === 'vote' && isPollAvailable(poll) && (
        <>
          <VotingForm
            poll={poll}
            members={members}
            activities={activities}
            onSubmit={({ memberId, activityId }) => onVote(memberId, activityId)}
            onRefresh={onRefresh}
          />
          <PollResultsComponent poll={poll} members={members} activities={activities} />
        </>
      )}
      {mode === 'results' && (
        <>
          <PollOverview poll={poll} />
          <PollResultsComponent poll={poll} members={members} activities={activities} />
        </>
      )}
    </div>
  )
}
