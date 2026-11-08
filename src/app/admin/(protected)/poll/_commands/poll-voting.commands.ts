import { addVote } from '@/infrastructure/poll/poll.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'

export function addPollVoteCommand(pollId: string, memberId: string, activityId: string): Promise<PollViewModel> {
  return unwrapActionResult(addVote({ id: pollId, memberId, activityId }))
}
