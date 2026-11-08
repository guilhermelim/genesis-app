import PollFactory from '@/domain/poll/factory/poll.factory'
import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import AddVotePollUseCase from './add-vote/add-vote.poll.usecase'
import ClearVotesPollUseCase from './clear-votes/clear-votes.poll.usecase'
import GetPollUseCase from './get/get.poll.usecase'
import UpdatePollUseCase from './update/update.poll.usecase'
import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import MemberFactory from '@/domain/member/factory/member.factory'
import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import ActivityFactory from '@/domain/activity/factory/activity.factory'
import PollVotingService from '@/domain/poll/service/poll-voting.service'
import CreatePollUseCase from './create/create.poll.usecase'
import ActivatePollUseCase from './activate/activate.poll.usecase'
import DeletePollUseCase from './delete/delete.poll.usecase'
import ListPollUseCase from './list/list.poll.usecase'

function createRepository(
  poll = PollFactory.create(
    'Nome',
    'Título',
    'Descrição',
    [],
    'poll-1',
    undefined,
    undefined,
    undefined,
    [],
    new Date(Date.now() + 60_000),
  ),
): jest.Mocked<PollRepositoryInterface> {
  let currentPoll = poll
  return {
    find: jest.fn().mockImplementation(async () => currentPoll),
    findOrCreateDefault: jest.fn().mockImplementation(async () => currentPoll),
    findActive: jest.fn(),
    findAll: jest.fn(),
    findPage: jest.fn(),
    save: jest.fn().mockImplementation(async (updatedPoll: typeof poll) => {
      currentPoll = updatedPoll
    }),
    create: jest.fn(),
    delete: jest.fn(),
  }
}

function createMemberRepository(
  member = MemberFactory.create('Guilherme', 'member-1'),
): jest.Mocked<MemberRepositoryInterface> {
  return {
    create: jest.fn(),
    find: jest.fn().mockResolvedValue(member),
    findAll: jest.fn(),
    findPage: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

function createActivityRepository(): jest.Mocked<ActivityRepositoryInterface> {
  return {
    create: jest.fn(),
    find: jest.fn().mockResolvedValue(ActivityFactory.create('Atividade', 'Descrição', '1', 'activity-1')),
    findAll: jest.fn(),
    findPage: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

describe('Poll use cases', () => {
  it('gets and updates poll data', async () => {
    const repository = createRepository()

    await expect(new GetPollUseCase(repository).execute()).resolves.toMatchObject({
      id: 'poll-1',
      name: 'Nome',
    })
    expect(repository.findOrCreateDefault).toHaveBeenCalledTimes(1)
    expect(repository.find).not.toHaveBeenCalled()
    await expect(new UpdatePollUseCase(repository).execute({ title: 'Novo título' })).resolves.toMatchObject({
      title: 'Novo título',
    })
    expect(repository.findOrCreateDefault).toHaveBeenCalledTimes(2)
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Novo título' }))
  })

  it('keeps existing values when update input omits them', async () => {
    const repository = createRepository()

    await expect(new UpdatePollUseCase(repository).execute({})).resolves.toMatchObject({
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
    })
  })

  it('updates a poll identified by its id', async () => {
    const repository = createRepository()

    await expect(
      new UpdatePollUseCase(repository).execute({
        id: 'poll-1',
        description: 'Descrição atualizada',
      }),
    ).resolves.toMatchObject({
      id: 'poll-1',
      description: 'Descrição atualizada',
    })

    expect(repository.find).toHaveBeenCalledWith('poll-1')
    expect(repository.findOrCreateDefault).not.toHaveBeenCalled()
  })

  it('adds and clears votes while preserving date values', async () => {
    const repository = createRepository()
    const memberRepository = createMemberRepository()
    const activityRepository = createActivityRepository()
    const withVote = await new AddVotePollUseCase(
      repository,
      memberRepository,
      activityRepository,
      new PollVotingService(),
    ).execute({
      memberId: 'member-1',
      activityId: 'activity-1',
    })

    expect(withVote.votes).toHaveLength(1)
    expect(withVote.createdAt).toBeInstanceOf(Date)
    expect(withVote.updatedAt).toBeInstanceOf(Date)
    expect(withVote.expiresAt).toBeInstanceOf(Date)
    expect(withVote.active).toBe(true)

    const cleared = await new ClearVotesPollUseCase(repository).execute()
    expect(cleared.votes).toEqual([])
    expect(JSON.parse(JSON.stringify(cleared)).createdAt).toEqual(cleared.createdAt.toISOString())
  })

  it('adds a vote to the requested poll instead of the default poll', async () => {
    const poll = PollFactory.create(
      'Enquete de teste',
      'Life Group 193',
      'Descrição',
      [],
      'poll-selected',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 60_000),
    )
    const repository = createRepository(poll)
    const memberRepository = createMemberRepository()
    const activityRepository = createActivityRepository()

    await new AddVotePollUseCase(repository, memberRepository, activityRepository, new PollVotingService()).execute({
      id: poll.id,
      memberId: 'member-1',
      activityId: 'activity-1',
    })

    expect(repository.find).toHaveBeenCalledWith('poll-selected')
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'poll-selected', votes: expect.anything() }),
    )
  })

  it('rejects votes from inactive members', async () => {
    const repository = createRepository()
    const memberRepository = createMemberRepository()
    const activityRepository = createActivityRepository()
    memberRepository.find.mockResolvedValue(MemberFactory.create('Guilherme', 'member-1', undefined, false))

    await expect(
      new AddVotePollUseCase(repository, memberRepository, activityRepository, new PollVotingService()).execute({
        memberId: 'member-1',
        activityId: 'activity-1',
      }),
    ).rejects.toThrow('Inactive members cannot vote.')
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('creates a poll and deactivates existing active polls', async () => {
    const repository = createRepository()
    const activePoll = PollFactory.createDefault()
    const inactivePoll = activePoll.deactivate()
    jest.mocked(repository.findAll!).mockResolvedValue([activePoll, inactivePoll])

    await expect(
      new CreatePollUseCase(repository).execute({
        name: 'Nova',
        title: 'Título',
        description: 'Descrição',
        expiresAt: new Date(Date.now() + 60_000),
        photos: [],
      }),
    ).resolves.toMatchObject({ name: 'Nova', active: true })

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ id: activePoll.id, active: false }))
    expect(repository.create).toHaveBeenCalled()
  })

  it('activates a poll while deactivating other active polls', async () => {
    const expiresAt = new Date(Date.now() + 60_000)
    const target = PollFactory.create(
      'Alvo',
      'Título',
      'Descrição',
      [],
      'target',
      undefined,
      undefined,
      undefined,
      [],
      expiresAt,
    )
    const other = PollFactory.create(
      'Outro',
      'Título',
      'Descrição',
      [],
      'other',
      undefined,
      undefined,
      undefined,
      [],
      expiresAt,
    )
    const repository = createRepository(target)
    jest.mocked(repository.findAll!).mockResolvedValue([target, other])

    await expect(new ActivatePollUseCase(repository).execute(target.id)).resolves.toMatchObject({
      id: target.id,
      active: true,
    })
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ id: other.id, active: false }))
  })

  it('lists and deletes polls through required repository methods', async () => {
    const poll = PollFactory.createDefault()
    const repository = createRepository(poll)
    jest.mocked(repository.findAll!).mockResolvedValue([poll])

    await expect(new ListPollUseCase(repository).execute()).resolves.toMatchObject([{ id: poll.id }])
    await expect(new DeletePollUseCase(repository).execute(poll.id)).resolves.toEqual({ id: poll.id })
    expect(repository.delete).toHaveBeenCalledWith(poll.id)
  })

  it('updates photos when they are supplied', async () => {
    const repository = createRepository()
    const photo = { id: 'photo-1', dataUrl: 'data:image/png;base64,abc', isPrimary: true }

    await expect(new UpdatePollUseCase(repository).execute({ photos: [photo] })).resolves.toMatchObject({
      photos: [photo],
    })
  })

  it('uses every required repository operation for lifecycle operations', async () => {
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-optional',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 60_000),
    )
    const repository = {
      find: jest.fn().mockResolvedValue(poll),
      findOrCreateDefault: jest.fn().mockResolvedValue(poll),
      findAll: jest.fn().mockResolvedValue([]),
      findActive: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      findPage: jest.fn().mockResolvedValue({ items: [], totalItems: 0 }),
      create: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    } as PollRepositoryInterface

    await expect(
      new CreatePollUseCase(repository).execute({
        name: 'Nova',
        title: 'Título',
        description: 'Descrição',
        expiresAt: new Date(Date.now() + 60_000),
      }),
    ).resolves.toMatchObject({ name: 'Nova' })
    await expect(new ActivatePollUseCase(repository).execute(poll.id)).resolves.toMatchObject({ id: poll.id })
    await expect(new DeletePollUseCase(repository).execute(poll.id)).resolves.toEqual({ id: poll.id })
    await expect(new ListPollUseCase(repository).execute()).resolves.toEqual([])
    expect(repository.findAll).toHaveBeenCalledTimes(3)
    expect(repository.create).toHaveBeenCalledTimes(1)
    expect(repository.delete).toHaveBeenCalledWith(poll.id)
  })

  it('normalizes a poll page beyond the available range', async () => {
    const repository = createRepository()
    repository.findPage
      .mockResolvedValueOnce({ items: [], totalItems: 1 })
      .mockResolvedValueOnce({ items: [PollFactory.createDefault()], totalItems: 1 })

    await expect(new ListPollUseCase(repository).executePage({ page: 99, pageSize: 10 })).resolves.toMatchObject({
      page: 1,
      totalItems: 1,
      totalPages: 1,
    })
  })
})
