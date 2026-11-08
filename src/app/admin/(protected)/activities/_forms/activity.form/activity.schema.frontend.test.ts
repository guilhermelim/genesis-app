import { activityDefaultValues } from './activity.default-values'
import { activitySchema } from './activity.schema'

describe('activity form contract', () => {
  it('provides safe defaults', () => {
    expect(activityDefaultValues).toEqual({ label: '', name: '', description: '', iconName: 'default' })
  })

  it('validates required fields and icon names', () => {
    expect(activitySchema.safeParse(activityDefaultValues).success).toBe(false)
    expect(
      activitySchema.safeParse({
        label: '07:30h',
        name: 'Corrida',
        description: 'Descrição',
        iconName: 'Music2',
      }).success,
    ).toBe(true)
  })
})
