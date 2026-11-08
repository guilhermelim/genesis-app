import PollSettings from './poll-settings'

describe('PollSettings', () => {
  it('accepts a valid global schedule', () => {
    expect(new PollSettings('default', 3, 0, 0)).toEqual(new PollSettings('default', 3, 0, 0))
  })

  it('is frozen after construction', () => {
    const settings = new PollSettings('default', 3, 0, 0)

    expect(Object.isFrozen(settings)).toBe(true)
    expect(Reflect.set(settings, 'hour', 12)).toBe(false)
    expect(settings.hour).toBe(0)
  })

  it.each([
    ['', 3, 0, 0],
    ['default', -1, 0, 0],
    ['default', 3, 24, 0],
    ['default', 3, 0, 60],
  ])('rejects invalid settings', (id, weekday, hour, minute) => {
    expect(() => new PollSettings(id, weekday, hour, minute)).toThrow()
  })
})
