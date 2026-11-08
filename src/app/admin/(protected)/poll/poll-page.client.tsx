'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Vote } from 'lucide-react'
import AdminPageCard from '../_components/admin-page-card'
import PollManagementSection from './_sections/poll-management.section'
import PollManagementComponent from './_components/poll-management.component'
import PollHistory from './_components/poll-history.component'
import { usePollState, type PollPageData } from './_hooks/use-poll-state'
import { usePollHistory } from './_hooks/use-poll-history'
import { usePollEditing } from './_hooks/use-poll-editing'
import { usePollVoting } from './_hooks/use-poll-voting'
import { isPollAvailable } from '@/app/_shared/poll/lib/poll-availability'
import type { PollSettings } from '@/app/_shared/poll/types/poll-view-model.types'
import type { PollMember } from '@/app/_shared/poll/types/poll-member.types'
import type { PollActivity } from '@/app/_shared/poll/types/poll-activity.types'

export default function PollPageClient({
  initialPage,
  settings,
  members,
  activities,
}: {
  initialPage: PollPageData
  settings: PollSettings
  members: PollMember[]
  activities: (PollActivity & { description: string })[]
}) {
  const state = usePollState({ initialPage })
  const history = usePollHistory({ state, settings })
  const editing = usePollEditing({
    poll: state.poll,
    replacePoll: state.replacePoll,
    setPanel: state.setPanel,
    setError: state.setError,
    clearError: state.clearError,
  })
  const voting = usePollVoting({
    poll: state.poll,
    replacePoll: state.replacePoll,
    setError: state.setError,
    clearError: state.clearError,
  })
  const { poll, panel, setPanel, error } = state

  return (
    <AdminPageCard
      title="Voluntariado"
      description="Configure as inscrições e acompanhe a participação."
      error={
        error && (
          <Alert variant="destructive">
            <AlertTitle>Operação não concluída</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )
      }
    >
      <PollHistory
        polls={state.polls}
        page={state.pagination.page}
        pageSize={state.pagination.pageSize}
        totalItems={state.pagination.totalItems}
        onPageChange={history.changePage}
        onPageSizeChange={history.changePageSize}
        settings={settings}
        selectedPollId={state.selectedPollId}
        onSelect={state.selectPoll}
        onCreate={history.create}
        onActivate={history.activate}
        onDelete={history.remove}
        onUpdateSettings={history.updateSettings}
      />
      {poll && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
            <div>
              <p className="text-sm font-semibold">Voluntariado selecionado</p>
              <p className="text-xs text-muted-foreground">{poll.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setPanel('results')}>
                <Eye className="size-4" />
                Visualizar
              </Button>
              {isPollAvailable(poll) && (
                <Button size="sm" variant="outline" onClick={() => setPanel('vote')}>
                  <Vote className="size-4" />
                  Inscrever-se
                </Button>
              )}
              <Button size="sm" variant="default" onClick={() => setPanel('edit')}>
                <Pencil className="size-4" />
                Editar
              </Button>
            </div>
          </div>
          <PollManagementSection
            poll={poll}
            members={members}
            activities={activities}
            onVote={voting.vote}
            onRefresh={() => undefined}
            mode={panel === 'edit' ? 'results' : panel}
          />
          <PollManagementComponent
            poll={poll}
            open={panel === 'edit'}
            onClose={() => setPanel('results')}
            onUpdate={editing.update}
            onClearVotes={editing.clear}
          />
        </>
      )}
    </AdminPageCard>
  )
}
