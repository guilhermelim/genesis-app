import { getAvailablePollActivities, getAvailablePollMembers, sortPollMembers } from './poll-sorting'

describe('poll sorting helpers', () => {
  const members = [
    { id: '2', name: 'João', active: true },
    { id: '1', name: 'Ana', active: true },
    { id: '3', name: 'Inativo', active: false },
  ]

  it('sorts members without mutating the input', () => {
    expect(sortPollMembers(members).map(member => member.id)).toEqual(['1', '3', '2'])
    expect(members[0].id).toBe('2')
  })

  it('uses ids as a stable tie breaker for equal names', () => {
    expect(
      sortPollMembers([
        { id: 'b', name: 'Ana', active: true },
        { id: 'a', name: 'ana', active: true },
      ]).map(member => member.id),
    ).toEqual(['a', 'b'])
  })

  it('filters active members who have not voted', () => {
    expect(getAvailablePollMembers(members, new Set(['1'])).map(member => member.id)).toEqual(['2'])
  })

  it('filters activities that have not been selected', () => {
    const activities = [
      { id: '1', name: 'Culto', label: '10h' },
      { id: '2', name: 'Café', label: '15h' },
    ]
    expect(getAvailablePollActivities(activities, new Set(['2']))).toEqual([activities[0]])
  })
})
