'use client'
import { useState } from 'react'
import PollSection from '@/app/home/_sections/poll/poll.section'
import ActivitiesDescriptionSection from '@/app/home/_sections/activity/activities-description.section'
import { addVote } from '@/infrastructure/poll/poll.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'
import type { PollViewModel as PollData } from '@/app/_shared/poll/types/poll-view-model.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function PollClient({
  poll: initialPoll,
  members,
  activities,
}: {
  poll: PollData | null
  members: { id: string; name: string; image?: string; active: boolean }[]
  activities: { id: string; name: string; label: string; description: string; iconName?: string }[]
}) {
  const [poll, setPoll] = useState(initialPoll)
  const [error, setError] = useState<string>()
  const vote = async (memberId: string, activityId: string) => {
    try {
      setError(undefined)
      setPoll(await unwrapActionResult(addVote({ id: poll!.id, memberId, activityId })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao registrar inscrição')
      throw e
    }
  }
  return (
    <section className="w-full min-w-0 space-y-8" aria-label="Voluntariado e atividades">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível registrar sua inscrição</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {poll ? (
        <PollSection poll={poll} members={members} activities={activities} onVote={vote} onRefresh={() => undefined} />
      ) : (
        <div className="rounded-xl border p-6 text-center text-muted-foreground">
          Nenhum voluntariado está disponível para inscrição.
        </div>
      )}
      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 sm:p-5">
        <ActivitiesDescriptionSection activities={activities} />
      </div>
    </section>
  )
}
