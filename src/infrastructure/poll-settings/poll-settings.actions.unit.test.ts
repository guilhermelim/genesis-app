import { revalidatePath } from 'next/cache'
import PollSettingsRepository from './repository/mongodb/poll-settings.repository'
import { getPollSettings, updatePollSettings } from './poll-settings.actions'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

describe('poll settings Server Actions', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('gets settings through the repository', async () => {
    jest.spyOn(PollSettingsRepository.prototype, 'find').mockResolvedValue({
      id: 'default',
      weekday: 2,
      hour: 18,
      minute: 30,
    } as never)

    await expect(getPollSettings()).resolves.toEqual({ weekday: 2, hour: 18, minute: 30 })
  })

  it('saves valid settings and revalidates the poll page', async () => {
    const save = jest.spyOn(PollSettingsRepository.prototype, 'save').mockResolvedValue()

    await expect(updatePollSettings({ weekday: 4, hour: 9, minute: 15 })).resolves.toEqual({
      success: true,
      data: { weekday: 4, hour: 9, minute: 15 },
    })

    expect(save).toHaveBeenCalledWith(expect.objectContaining({ id: 'default', weekday: 4, hour: 9, minute: 15 }))
    expect(revalidatePath).toHaveBeenCalledWith('/admin/poll')
  })

  it.each([
    { weekday: -1, hour: 0, minute: 0 },
    { weekday: 7, hour: 0, minute: 0 },
    { weekday: 0, hour: 24, minute: 0 },
    { weekday: 0, hour: 0, minute: 60 },
  ])('rejects invalid settings %#', async input => {
    await expect(updatePollSettings(input)).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
  })
})
