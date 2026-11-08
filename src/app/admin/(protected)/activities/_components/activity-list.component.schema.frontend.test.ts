import { activityListItemSchema } from './activity-list.component.schema'

describe('activityListItemSchema', () => {
  it('accepts a complete activity item', () => {
    expect(
      activityListItemSchema.safeParse({
        id: 'activity-1',
        label: '09h',
        name: 'Acolhimento',
        description: 'Descrição',
        iconName: 'default',
      }).success,
    ).toBe(true)
  })

  it.each([
    ['label', { id: '1', label: '', name: 'Nome', description: 'Descrição', iconName: 'default' }],
    ['name', { id: '1', label: '09h', name: '', description: 'Descrição', iconName: 'default' }],
    ['description', { id: '1', label: '09h', name: 'Nome', description: '', iconName: 'default' }],
    ['iconName', { id: '1', label: '09h', name: 'Nome', description: 'Descrição', iconName: '' }],
  ])('rejects an empty %s', (_, value) => {
    expect(activityListItemSchema.safeParse(value).success).toBe(false)
  })
})
