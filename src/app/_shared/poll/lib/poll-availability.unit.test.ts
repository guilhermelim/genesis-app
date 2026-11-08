import { isPollAvailable, isPollExpired } from './poll-availability'

describe('poll availability helpers', () => {
  const now = new Date('2026-01-01T12:00:00.000Z')

  it('identifies expired polls', () => {
    expect(isPollExpired(new Date('2026-01-01T11:59:59.000Z'), now)).toBe(true)
    expect(isPollExpired(new Date('2026-01-01T12:00:00.000Z'), now)).toBe(true)
    expect(isPollExpired(new Date('2026-01-01T12:00:01.000Z'), now)).toBe(false)
  })

  it('requires an active poll with a future expiration date', () => {
    expect(isPollAvailable({ active: true, expiresAt: new Date('2026-01-01T12:00:01.000Z') }, now)).toBe(true)
    expect(isPollAvailable({ active: false, expiresAt: new Date('2026-01-01T12:00:01.000Z') }, now)).toBe(false)
    expect(isPollAvailable({ active: true, expiresAt: new Date('2026-01-01T11:59:59.000Z') }, now)).toBe(false)
  })
})
