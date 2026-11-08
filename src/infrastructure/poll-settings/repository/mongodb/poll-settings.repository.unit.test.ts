import Database from '@/lib/database'
import { PollSettingsModel } from './model/poll-settings.model'
import PollSettingsRepository from './poll-settings.repository'

const query = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) })

jest.mock('./model/poll-settings.model', () => ({
  PollSettingsModel: {
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  },
}))

describe('PollSettingsRepository', () => {
  beforeEach(() => {
    jest.spyOn(Database, 'connect').mockResolvedValue({} as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates default settings when none exist', async () => {
    jest.mocked(PollSettingsModel.findById).mockReturnValue(query(null) as never)
    jest.mocked(PollSettingsModel.create).mockResolvedValue({
      _id: 'default',
      weekday: 3,
      hour: 0,
      minute: 0,
    } as never)

    await expect(new PollSettingsRepository().find()).resolves.toEqual({
      id: 'default',
      weekday: 3,
      hour: 0,
      minute: 0,
    })
    expect(PollSettingsModel.create).toHaveBeenCalledWith({ _id: 'default', weekday: 3, hour: 0, minute: 0 })
  })

  it('reads and saves existing settings', async () => {
    jest
      .mocked(PollSettingsModel.findById)
      .mockReturnValue(query({ _id: 'default', weekday: 5, hour: 20, minute: 45 }) as never)
    jest.mocked(PollSettingsModel.updateOne).mockReturnValue(query({}) as never)

    const repository = new PollSettingsRepository()
    await expect(repository.find()).resolves.toEqual({ id: 'default', weekday: 5, hour: 20, minute: 45 })

    await expect(repository.save({ id: 'default', weekday: 1, hour: 8, minute: 5 } as never)).resolves.toBeUndefined()
    expect(PollSettingsModel.updateOne).toHaveBeenCalledWith(
      { _id: 'default' },
      { weekday: 1, hour: 8, minute: 5 },
      { upsert: true },
    )
  })
})
