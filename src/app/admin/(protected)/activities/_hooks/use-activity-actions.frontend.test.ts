import { act, renderHook } from '@testing-library/react'
import {
  createActivityCommand,
  deleteActivityCommand,
  updateActivityCommand,
} from '../_commands/activity-actions.commands'
import { listActivitiesCommand } from '../_commands/activity-list.commands'
import { useActivityActions } from './use-activity-actions'

jest.mock('../_commands/activity-actions.commands', () => ({
  createActivityCommand: jest.fn(),
  deleteActivityCommand: jest.fn(),
  updateActivityCommand: jest.fn(),
}))
jest.mock('../_commands/activity-list.commands', () => ({ listActivitiesCommand: jest.fn() }))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const activity = { id: 'activity-1', label: '07:30h', name: 'Corrida', description: 'Descrição', iconName: 'Bike' }
const page = { items: [activity], page: 1, pageSize: 10, totalItems: 1, totalPages: 1 }

describe('useActivityActions', () => {
  it('creates, updates, and removes activities', async () => {
    jest.mocked(createActivityCommand).mockResolvedValue({ ...activity, id: 'activity-2' })
    jest.mocked(listActivitiesCommand).mockResolvedValue(page)
    jest.mocked(updateActivityCommand).mockResolvedValue(activity)
    jest.mocked(deleteActivityCommand).mockResolvedValue({ id: activity.id })
    const replacePage = jest.fn()
    const replaceActivity = jest.fn()
    const removeActivity = jest.fn()
    const { result } = renderHook(() =>
      useActivityActions({
        activities: [activity],
        pagination: page,
        replacePage,
        replaceActivity,
        removeActivity,
        closeCreate: jest.fn(),
      }),
    )

    await act(() =>
      result.current.create({ label: '09:00h', name: 'Natação', description: 'Descrição', iconName: 'default' }),
    )
    await act(() => result.current.update(activity))
    await act(() => result.current.remove(activity.id))

    expect(createActivityCommand).toHaveBeenCalled()
    expect(updateActivityCommand).toHaveBeenCalledWith(activity)
    expect(removeActivity).toHaveBeenCalledWith(activity.id)
  })

  it('handles action failures without rejecting to callers', async () => {
    jest.mocked(updateActivityCommand).mockRejectedValue(new Error('Falha'))
    const { result } = renderHook(() =>
      useActivityActions({
        activities: [activity],
        pagination: page,
        replacePage: jest.fn(),
        replaceActivity: jest.fn(),
        removeActivity: jest.fn(),
        closeCreate: jest.fn(),
      }),
    )

    await act(() => result.current.update(activity))
    expect(updateActivityCommand).toHaveBeenCalledWith(activity)
  })

  it('handles create and delete failures and reloads the previous page after deleting its last item', async () => {
    jest.mocked(createActivityCommand).mockRejectedValueOnce(new Error('Falha ao criar'))
    jest.mocked(deleteActivityCommand).mockResolvedValueOnce({ id: activity.id })
    jest.mocked(listActivitiesCommand).mockResolvedValue({ ...page, page: 1 })
    const replacePage = jest.fn()
    const { result } = renderHook(() =>
      useActivityActions({
        activities: [activity],
        pagination: { ...page, page: 2 },
        replacePage,
        replaceActivity: jest.fn(),
        removeActivity: jest.fn(),
        closeCreate: jest.fn(),
      }),
    )

    await act(() =>
      result.current.create({ label: '09:00h', name: 'Natação', description: 'Descrição', iconName: 'default' }),
    )
    await act(() => result.current.remove(activity.id))

    expect(listActivitiesCommand).toHaveBeenCalledWith(1, 10)
    expect(replacePage).toHaveBeenCalled()
  })

  it('reports delete failures without rejecting', async () => {
    jest.mocked(deleteActivityCommand).mockRejectedValue('Falha ao excluir')
    const { result } = setup()
    await act(() => result.current.remove(activity.id))
    expect(deleteActivityCommand).toHaveBeenCalledWith(activity.id)
  })

  it('uses the error message when delete fails with an Error', async () => {
    jest.mocked(deleteActivityCommand).mockRejectedValue(new Error('Falha ao excluir'))
    const { result } = setup()
    await act(() => result.current.remove(activity.id))
    expect(deleteActivityCommand).toHaveBeenCalledWith(activity.id)
  })

  it('uses fallback descriptions for non-Error failures in create and update', async () => {
    jest.mocked(createActivityCommand).mockRejectedValueOnce('Falha ao criar')
    jest.mocked(updateActivityCommand).mockRejectedValueOnce('Falha ao atualizar')
    const { result } = setup()
    await act(() =>
      result.current.create({ label: '09:00h', name: 'Natação', description: 'Descrição', iconName: 'default' }),
    )
    await act(() => result.current.update(activity))
    expect(createActivityCommand).toHaveBeenCalled()
    expect(updateActivityCommand).toHaveBeenCalled()
  })
})

function setup() {
  return renderHook(() =>
    useActivityActions({
      activities: [activity],
      pagination: page,
      replacePage: jest.fn(),
      replaceActivity: jest.fn(),
      removeActivity: jest.fn(),
      closeCreate: jest.fn(),
    }),
  )
}
