import { memberListItemSchema } from './member-list.component.schema'

describe('memberListItemSchema', () => {
  it('accepts a member with or without an image', () => {
    expect(memberListItemSchema.safeParse({ id: '1', name: 'Ana', active: true }).success).toBe(true)
    expect(memberListItemSchema.safeParse({ id: '1', name: 'Ana', image: 'data:image', active: false }).success).toBe(
      true,
    )
  })

  it.each([
    { id: '1', name: '', active: true },
    { id: '1', name: 'Ana', active: 'true' },
  ])('rejects invalid member data %#', value => {
    expect(memberListItemSchema.safeParse(value).success).toBe(false)
  })
})
