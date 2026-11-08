import { memberDefaultValues } from './member.default-values'
import { memberSchema } from './member.schema'

describe('member form contract', () => {
  it('provides an active empty member by default', () => {
    expect(memberDefaultValues).toEqual({ id: '', name: '', image: undefined, active: true })
  })

  it('requires a name and accepts an optional image', () => {
    expect(memberSchema.safeParse(memberDefaultValues).success).toBe(false)
    expect(memberSchema.parse({ name: 'Ana', image: 'data:image/png;base64,test', active: true })).toEqual({
      name: 'Ana',
      image: 'data:image/png;base64,test',
      active: true,
    })
  })
})
