import ActivityIconName from './activity-icon-name'

describe('ActivityIconName', () => {
  it('uses default when no value is provided', () => {
    expect(new ActivityIconName().value).toBe('default')
  })

  it('accepts supported icon references', () => {
    expect(new ActivityIconName('Music2').value).toBe('Music2')
  })

  it('rejects unsupported icon references', () => {
    expect(() => new ActivityIconName('UnknownIcon')).toThrow('Invalid activity icon name.')
  })
})
