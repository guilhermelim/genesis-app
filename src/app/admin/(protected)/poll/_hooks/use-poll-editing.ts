'use client'

import { toast } from 'sonner'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import type { PollFormValues } from '../_forms/poll.form/poll.schema'
import { clearPollVotesCommand, updatePollCommand } from '../_commands/poll-editing.commands'

interface UsePollEditingOptions {
  poll?: PollViewModel
  replacePoll: (poll: PollViewModel) => void
  setPanel: (panel: 'vote' | 'results' | 'edit') => void
  setError: (message: string | undefined) => void
  clearError: () => void
}

export function usePollEditing({ poll, replacePoll, setPanel, setError, clearError }: UsePollEditingOptions) {
  const run = async <T>(action: Promise<T>) => {
    try {
      const result = await action
      clearError()
      return result
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a operação')
      throw cause
    }
  }

  const update = async (data: PollFormValues) => {
    if (!poll) return
    try {
      const output = await run(updatePollCommand(poll.id, data))
      replacePoll({ ...poll, ...output })
      setPanel('results')
      toast.success('Enquete atualizada', { description: 'As alterações da enquete foram salvas com sucesso.' })
    } catch (cause) {
      toast.error('Não foi possível atualizar a enquete', {
        description: cause instanceof Error ? cause.message : 'Tente novamente.',
      })
      throw cause
    }
  }

  const clear = async () => {
    if (!poll) return
    const output = await run(clearPollVotesCommand(poll.id))
    replacePoll({ ...poll, ...output })
  }

  return { update, clear }
}
