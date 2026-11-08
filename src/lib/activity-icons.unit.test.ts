import { getActivityIcon, activityIconOptions } from './activity-icons'

describe('activity icons', () => {
  it('exposes all supported icon options', () => {
    expect(activityIconOptions.length).toBeGreaterThan(1)
    expect(activityIconOptions.map(option => option.name)).toContain('Music2')
  })

  it('returns the requested icon and falls back to Sparkles', () => {
    expect(getActivityIcon('Music2')).toBe(activityIconOptions.find(option => option.name === 'Music2')?.icon)
    expect(getActivityIcon('unknown')).toBe(activityIconOptions[0].icon)
    expect(getActivityIcon()).toBe(activityIconOptions[0].icon)
  })
})
