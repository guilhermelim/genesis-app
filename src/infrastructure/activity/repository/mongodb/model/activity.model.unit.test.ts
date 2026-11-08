describe('ActivityModel legacy schema migration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetModules()
  })

  it('adds iconName to an existing model that predates the field', () => {
    jest.resetModules()
    const add = jest.fn()
    const path = jest.fn().mockReturnValue(undefined)

    jest.isolateModules(() => {
      const mongoose = jest.requireActual<typeof import('mongoose')>('mongoose')
      delete mongoose.models.activities
      mongoose.models.activities = { schema: { path, add } } as never
      jest.requireActual('./activity.model')
    })

    expect(path).toHaveBeenCalledWith('iconName')
    expect(add).toHaveBeenCalledWith({
      iconName: { type: String, required: true, default: 'default', trim: true },
    })
  })
})
