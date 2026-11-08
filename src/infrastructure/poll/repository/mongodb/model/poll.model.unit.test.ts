import { PollModel } from './poll.model'

describe('PollModel schema defaults', () => {
  it('generates an expiration date one week in the future', () => {
    const defaultExpiresAt = PollModel.schema.path('expiresAt').options.default
    if (typeof defaultExpiresAt !== 'function') {
      throw new Error('expiresAt default must be a function')
    }

    const before = Date.now()
    const expiresAt = defaultExpiresAt()
    const after = Date.now()

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 7 * 24 * 60 * 60 * 1000)
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + 7 * 24 * 60 * 60 * 1000)
  })
})
