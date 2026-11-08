import { clearVotes, updatePoll } from '@/infrastructure/poll/poll.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'
import type { PollFormValues } from '../_forms/poll.form/poll.schema'

export function updatePollCommand(id: string, input: PollFormValues): Promise<Partial<PollViewModel>> {
  return unwrapActionResult(updatePoll({ ...input, id }))
}

export function clearPollVotesCommand(id: string): Promise<Partial<PollViewModel>> {
  return unwrapActionResult(clearVotes(id))
}
