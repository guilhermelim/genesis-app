import { pollSettingsDefaultValues } from './poll-settings.default-values'
import { pollSettingsSchema } from './poll-settings.schema'

describe('poll settings form contract', () => {
  it('provides midnight on Sunday as the default', () => {
    expect(pollSettingsDefaultValues).toEqual({ weekday: 0, hour: 0, minute: 0 })
  })

  it('accepts valid ranges and rejects values outside them', () => {
    expect(pollSettingsSchema.safeParse({ weekday: 6, hour: 23, minute: 59 }).success).toBe(true)
    expect(pollSettingsSchema.safeParse({ weekday: 7, hour: 24, minute: 60 }).success).toBe(false)
  })
})
