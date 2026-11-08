import { addVote } from '@/infrastructure/poll/poll.actions'
import { addPollVoteCommand } from './poll-voting.commands'

jest.mock('@/infrastructure/poll/poll.actions', () => ({ addVote: jest.fn() }))
jest.mock('@/infrastructure/action-result', () => ({ unwrapActionResult: (result: unknown) => result }))

it('delegates a vote with the poll, member, and activity identifiers', async () => {
  const result = { id: 'poll-1' }
  jest.mocked(addVote).mockResolvedValue(result as never)

  await expect(addPollVoteCommand('poll-1', 'member-1', 'activity-1')).resolves.toBe(result)
  expect(addVote).toHaveBeenCalledWith({ id: 'poll-1', memberId: 'member-1', activityId: 'activity-1' })
})
