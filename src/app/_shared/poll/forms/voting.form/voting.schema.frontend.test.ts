import { votingDefaultValues } from './voting.default-values'
import { votingSchema } from './voting.schema'

describe('voting form contract', () => {
  it('exposes empty defaults', () => {
    expect(votingDefaultValues).toEqual({ memberId: '', activityId: '' })
  })

  it('requires both selections', () => {
    expect(votingSchema.safeParse(votingDefaultValues).success).toBe(false)
    expect(votingSchema.parse({ memberId: 'member-1', activityId: 'activity-1' })).toEqual({
      memberId: 'member-1',
      activityId: 'activity-1',
    })
  })
})
