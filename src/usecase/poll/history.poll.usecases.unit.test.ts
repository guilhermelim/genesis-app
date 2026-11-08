import PollFactory from '@/domain/poll/factory/poll.factory'
import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import ActivatePollUseCase from './activate/activate.poll.usecase'
import CreatePollUseCase from './create/create.poll.usecase'
import DeletePollUseCase from './delete/delete.poll.usecase'
import ListPollUseCase from './list/list.poll.usecase'

function repository(polls: ReturnType<typeof PollFactory.create>[] = []): jest.Mocked<PollRepositoryInterface> {
  return {
    find: jest.fn().mockImplementation(async (id: string) => polls.find(poll => poll.id === id) ?? polls[0]),
    findOrCreateDefault: jest.fn().mockResolvedValue(polls[0]),
    findActive: jest.fn().mockResolvedValue(polls.find(poll => poll.active) ?? null),
    findAll: jest.fn().mockResolvedValue(polls),
    findPage: jest.fn().mockResolvedValue({ items: polls, totalItems: polls.length }),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  }
}

describe('Poll history use cases', () => {
  it('creates a new active poll and deactivates the previous one', async () => {
    const previous = PollFactory.create(
      'Antiga',
      'Título',
      'Descrição',
      [],
      'poll-1',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 1000),
      true,
    )
    const repo = repository([previous])
    const result = await new CreatePollUseCase(repo).execute({
      name: 'Nova',
      title: 'Novo título',
      description: 'Descrição',
      expiresAt: new Date(Date.now() + 60_000),
      photos: [{ id: 'photo-1', dataUrl: 'data:image/png;base64,abc', isPrimary: true }],
    })
    expect(previous.active).toBe(true)
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: previous.id, active: false }))
    expect(repo.create).toHaveBeenCalled()
    expect(result.active).toBe(true)
  })

  it('lists, activates and deletes polls', async () => {
    const expiresAt = new Date(Date.now() + 60_000)
    const first = PollFactory.create(
      'Primeira',
      'Título',
      'Descrição',
      [],
      'poll-1',
      undefined,
      undefined,
      undefined,
      [],
      expiresAt,
    )
    const second = PollFactory.create(
      'Segunda',
      'Título',
      'Descrição',
      [],
      'poll-2',
      undefined,
      undefined,
      undefined,
      [],
      expiresAt,
      false,
    )
    const repo = repository([first, second])
    await expect(new ListPollUseCase(repo).execute()).resolves.toHaveLength(2)
    await new ActivatePollUseCase(repo).execute('poll-2')
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: first.id, active: false }))
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: second.id, active: true }))
    await expect(new DeletePollUseCase(repo).execute('poll-2')).resolves.toEqual({ id: 'poll-2' })
    expect(repo.delete).toHaveBeenCalledWith('poll-2')
  })

  it('does not deactivate the current poll when activating an expired poll', async () => {
    const current = PollFactory.create(
      'Atual',
      'Título',
      'Descrição',
      [],
      'poll-current',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 60_000),
      true,
    )
    const expired = PollFactory.create(
      'Expirada',
      'Título',
      'Descrição',
      [],
      'poll-expired',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() - 1),
      false,
    )
    const repo = repository([current, expired])

    await expect(new ActivatePollUseCase(repo).execute(expired.id)).rejects.toThrow(
      'Cannot activate a poll with an expired expiration date.',
    )
    expect(current.active).toBe(true)
    expect(repo.save).not.toHaveBeenCalled()
  })
})
