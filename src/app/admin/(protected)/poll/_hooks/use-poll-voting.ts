'use client'

import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import { addPollVoteCommand } from '../_commands/poll-voting.commands'

interface UsePollVotingOptions {
  poll?: PollViewModel
  replacePoll: (poll: PollViewModel) => void
  setError: (message: string | undefined) => void
  clearError: () => void
}

export function usePollVoting({ poll, replacePoll, setError, clearError }: UsePollVotingOptions) {
  const vote = async (memberId: string, activityId: string) => {
    if (!poll) return
    try {
      const output = await addPollVoteCommand(poll.id, memberId, activityId)
      clearError()
      replacePoll(output)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a votação')
      throw cause
    }
  }

  return { vote }
}
