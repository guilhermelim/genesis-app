import Activity from './activity'

describe('Activity', () => {
  it('changes its editable fields', () => {
    const activity = new Activity('Louvor', 'Descrição', '7:30h', 'activity-1')

    const updatedName = activity.changeName('Novo nome')
    const updatedDescription = updatedName.changeDescription('Nova descrição')
    const updatedActivity = updatedDescription.changeLabel('8:00h')
    const iconActivity = updatedActivity.changeIconName('Music2')

    expect(updatedActivity.name).toBe('Novo nome')
    expect(updatedActivity.description).toBe('Nova descrição')
    expect(updatedActivity.label).toBe('8:00h')
    expect(activity.name).toBe('Louvor')
    expect(activity.description).toBe('Descrição')
    expect(activity.label).toBe('7:30h')
    expect(iconActivity.iconName).toBe('Music2')
    expect(activity.iconName).toBe('default')
    expect(iconActivity).not.toBe(activity)
  })

  it('uses default when no icon name is provided', () => {
    const activity = new Activity('Louvor', 'Descrição', '7:30h', 'activity-1')

    expect(activity.iconName).toBe('default')
  })

  it('is frozen and cannot be mutated in place', () => {
    const activity = new Activity('Louvor', 'Descrição', '7:30h', 'activity-1')

    expect(Object.isFrozen(activity)).toBe(true)
    expect(Reflect.set(activity, '_name', 'Nome inválido')).toBe(false)
    expect(activity.name).toBe('Louvor')
  })

  it.each([
    ['', 'Descrição', '7:30h', 'Name is required.'],
    ['Louvor', 'Descrição', '', 'Label is required.'],
    ['Louvor', 'Descrição', '7:30h', 'Invalid ID.'],
  ])('rejects invalid state', (name, description, label, message) => {
    const id = message === 'Invalid ID.' ? '' : 'activity-1'

    expect(() => new Activity(name, description, label, id)).toThrow(message)
  })
})
