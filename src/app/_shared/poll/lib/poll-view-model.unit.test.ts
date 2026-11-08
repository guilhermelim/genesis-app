import { getNextPollExpiration, getPollVoteRecords } from './poll-view-model'

describe('poll view model helpers', () => {
  it('calculates the next configured expiration', () => {
    const result = getNextPollExpiration({ weekday: 1, hour: 10, minute: 30 }, new Date('2026-01-04T08:00:00.000Z'))
    expect(result.getDay()).toBe(1)
    expect(result.getHours()).toBe(10)
    expect(result.getMinutes()).toBe(30)
  })

  it('joins votes with their member and activity', () => {
    const records = getPollVoteRecords(
      { votes: [{ id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt: new Date() }] },
      [{ id: 'member-1', name: 'Ana', active: true }],
      [{ id: 'activity-1', name: 'Culto', label: '10h' }],
    )
    expect(records[0].member?.name).toBe('Ana')
    expect(records[0].activity?.name).toBe('Culto')
  })
})
