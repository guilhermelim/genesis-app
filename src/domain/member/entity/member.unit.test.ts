import Member from './member'

describe('Member', () => {
  it('changes its name', () => {
    const member = new Member('Guilherme', 'member-1')

    const updatedMember = member.changeName('Novo nome')

    expect(updatedMember.name).toBe('Novo nome')
    expect(member.name).toBe('Guilherme')
    expect(updatedMember).not.toBe(member)
  })

  it('changes its image', () => {
    const member = new Member('Guilherme', 'member-1')

    const updatedMember = member.changeImage('data:image/jpeg;base64,image')

    expect(updatedMember.image).toBe('data:image/jpeg;base64,image')
    expect(member.image).toBeUndefined()
    expect(updatedMember).not.toBe(member)
  })

  it('deactivates and activates itself', () => {
    const member = new Member('Guilherme', 'member-1')

    const inactiveMember = member.deactivate()
    expect(inactiveMember.active).toBe(false)
    expect(member.active).toBe(true)

    const activeMember = inactiveMember.activate()
    expect(activeMember.active).toBe(true)
    expect(inactiveMember.active).toBe(false)
  })

  it('is frozen and cannot be mutated in place', () => {
    const member = new Member('Guilherme', 'member-1')

    expect(Object.isFrozen(member)).toBe(true)
    expect(Reflect.set(member, '_name', 'Nome inválido')).toBe(false)
    expect(member.name).toBe('Guilherme')
  })

  it.each([
    ['', 'member-1', 'Name is required.'],
    ['Guilherme', '', 'Invalid ID.'],
  ])('rejects invalid state', (name, id, message) => {
    expect(() => new Member(name, id)).toThrow(message)
  })
})
