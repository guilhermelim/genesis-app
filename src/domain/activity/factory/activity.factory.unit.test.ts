import ActivityFactory from './activity.factory'

describe('ActivityFactory', () => {
  it('creates an activity with a generated id', () => {
    const activity = ActivityFactory.create('Louvor', 'Descrição', '7:30h')

    expect(activity.id).toEqual(expect.any(String))
    expect(activity.name).toBe('Louvor')
    expect(activity.label).toBe('7:30h')
    expect(activity.iconName).toBe('default')
  })
})
