import MemberFactory from './member.factory'

describe('MemberFactory', () => {
  it('creates a member with a generated id', () => {
    const member = MemberFactory.create('Guilherme')

    expect(member.name).toBe('Guilherme')
    expect(member.id).toEqual(expect.any(String))
  })

  it('preserves an id when reconstituting a member', () => {
    const member = MemberFactory.create('Guilherme', 'member-1')

    expect(member.id).toBe('member-1')
  })
})
