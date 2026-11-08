import { createActivity, deleteActivity, updateActivity } from '@/infrastructure/activity/activity.actions'
import type { ActionResult } from '@/infrastructure/action-result'
import { createActivityCommand, deleteActivityCommand, updateActivityCommand } from './activity-actions.commands'

jest.mock('@/infrastructure/activity/activity.actions', () => ({
  createActivity: jest.fn(),
  deleteActivity: jest.fn(),
  updateActivity: jest.fn(),
}))

describe('activity action commands', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('unwraps activity creation results', async () => {
    const activity = {
      id: 'activity-1',
      label: 'TR',
      name: 'Trilha',
      description: 'Ao ar livre',
      iconName: 'Music2',
    } as const
    jest.mocked(createActivity).mockResolvedValue({ success: true, data: activity })

    await expect(
      createActivityCommand({ label: 'TR', name: 'Trilha', description: 'Ao ar livre', iconName: 'Music2' }),
    ).resolves.toEqual(activity)
  })

  it('unwraps activity update results', async () => {
    const activity = {
      id: 'activity-1',
      label: 'TR',
      name: 'Trilha',
      description: 'Ao ar livre',
      iconName: 'Music2',
    } as const
    jest.mocked(updateActivity).mockResolvedValue({ success: true, data: activity })

    await expect(updateActivityCommand(activity)).resolves.toEqual(activity)
  })

  it('unwraps activity deletion results', async () => {
    const result = { id: 'activity-1' }
    jest.mocked(deleteActivity).mockResolvedValue({ success: true, data: result })

    await expect(deleteActivityCommand('activity-1')).resolves.toEqual(result)
  })

  it('throws the normalized action error', async () => {
    const failure: ActionResult<never> = {
      success: false,
      error: { code: 'DOMAIN_ERROR', message: 'Atividade inválida.' },
    }
    jest.mocked(createActivity).mockResolvedValue(failure)

    await expect(
      createActivityCommand({ label: 'TR', name: 'Trilha', description: 'Ao ar livre', iconName: 'Music2' }),
    ).rejects.toThrow('Atividade inválida.')
  })
})
