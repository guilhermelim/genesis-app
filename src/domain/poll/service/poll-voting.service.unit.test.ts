import MemberFactory from '@/domain/member/factory/member.factory'
import PollFactory from '@/domain/poll/factory/poll.factory'
import PollVotingService from './poll-voting.service'
import ActivityFactory from '@/domain/activity/factory/activity.factory'

describe('PollVotingService', () => {
  it('registers a vote for an active member', () => {
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-1',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 60_000),
    )
    const member = MemberFactory.create('Guilherme', 'member-1')

    const activity = ActivityFactory.create('Atividade', 'Descrição', '1', 'activity-1')
    const updatedPoll = new PollVotingService().registerVote(poll, member, activity)

    expect(updatedPoll.votes).toHaveLength(1)
    expect(updatedPoll.votes[0]).toMatchObject({ memberId: 'member-1', activityId: 'activity-1' })
  })

  it('rejects inactive members before changing the poll', () => {
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-1',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 60_000),
    )
    const member = MemberFactory.create('Guilherme', 'member-1', undefined, false)

    const activity = ActivityFactory.create('Atividade', 'Descrição', '1', 'activity-1')
    expect(() => new PollVotingService().registerVote(poll, member, activity)).toThrow('Inactive members cannot vote.')
    expect(poll.votes).toHaveLength(0)
  })

  it('rejects votes for an expired poll', () => {
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-1',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() - 60_000),
    )
    const member = MemberFactory.create('Guilherme', 'member-1')
    const activity = ActivityFactory.create('Atividade', 'Descrição', '1', 'activity-1')

    expect(() => new PollVotingService().registerVote(poll, member, activity)).toThrow(
      'Votes cannot be registered for an expired poll.',
    )
  })
})
