import { act, renderHook } from '@testing-library/react'
import { useVotingForm } from './voting.hook'
import { waitFor } from '@testing-library/react'

const members = [
  { id: 'member-1', name: 'Ana', image: undefined, active: true },
  { id: 'member-2', name: 'Bruno', image: undefined, active: true },
]
const activities = [
  { id: 'activity-1', label: '07:30h', name: 'Corrida', iconName: 'Bike' },
  { id: 'activity-2', label: '09:00h', name: 'Natação', iconName: 'Waves' },
]

describe('useVotingForm', () => {
  beforeEach(() => localStorage.clear())

  it('restores a valid last member and filters already voted options', () => {
    localStorage.setItem('genesis:last-member', 'member-1')
    const { result } = renderHook(() =>
      useVotingForm({
        poll: {
          votes: [{ memberId: 'member-2', activityId: 'activity-1' }],
          active: true,
          expiresAt: new Date(Date.now() + 60_000),
        },
        members,
        activities,
        onSubmit: jest.fn(),
      }),
    )

    expect(result.current.sortedMembers).toEqual([members[0]])
    expect(result.current.availableActivities).toEqual([activities[1]])
    expect(result.current.canVote).toBe(true)
    expect(result.current.selectedMember).toEqual(members[0])
  })

  it('does not allow inactive or expired polls to receive votes', () => {
    const { result } = renderHook(() =>
      useVotingForm({
        poll: { votes: [], active: false, expiresAt: new Date(Date.now() + 60_000) },
        members,
        activities,
        onSubmit: jest.fn(),
      }),
    )

    expect(result.current.canVote).toBe(false)
  })

  it('submits valid data, resets the form, and clears loading', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useVotingForm({
        poll: { votes: [], active: true, expiresAt: new Date(Date.now() + 60_000) },
        members,
        activities,
        onSubmit,
      }),
    )

    act(() => {
      result.current.form.setValue('memberId', 'member-1')
      result.current.form.setValue('activityId', 'activity-1')
    })
    await act(() => result.current.handleSubmit())

    expect(onSubmit).toHaveBeenCalledWith({ memberId: 'member-1', activityId: 'activity-1' })
    await waitFor(() => expect(result.current.form.getValues()).toEqual({ memberId: '', activityId: '' }))
    expect(result.current.loading).toBe(false)
  })
})
