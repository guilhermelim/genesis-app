import PollFactory from '@/domain/poll/factory/poll.factory'
import Database from '@/lib/database'
import PollRepository from './poll.repository'
import { PollModel } from './model/poll.model'

jest.mock('./model/poll.model', () => ({
  PollModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}))

const query = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
})

describe('PollRepository', () => {
  beforeEach(() => {
    jest.spyOn(Database, 'connect').mockResolvedValue({} as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('creates and returns the default poll when none exists', async () => {
    const defaultPoll = PollFactory.createDefault()
    jest.mocked(PollModel.findOne).mockReturnValue(query(null) as never)
    jest.mocked(PollModel.create).mockResolvedValue({
      _id: defaultPoll.id,
      name: defaultPoll.name,
      title: defaultPoll.title,
      description: defaultPoll.description,
      votes: [],
      photos: [],
      expiresAt: expect.any(Date),
      active: true,
    } as never)

    const poll = await new PollRepository().findOrCreateDefault()

    expect(poll).toMatchObject({
      name: defaultPoll.name,
      title: defaultPoll.title,
      description: defaultPoll.description,
      votes: [],
      photos: [],
      expiresAt: expect.any(Date),
      active: true,
    })
    expect(PollModel.create).toHaveBeenCalledWith({
      _id: expect.any(String),
      name: defaultPoll.name,
      title: defaultPoll.title,
      description: defaultPoll.description,
      votes: [],
      photos: [],
      expiresAt: expect.any(Date),
      active: true,
    })
  })

  it('reconstitutes an existing poll and saves its votes', async () => {
    const votedAt = new Date('2026-01-01T00:00:00.000Z')
    const document = {
      _id: 'poll-1',
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
      photos: [],
      expiresAt: expect.any(Date),
      active: true,
      votes: [{ _id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt }],
      createdAt: votedAt,
      updatedAt: votedAt,
      __v: 0,
    }
    jest.mocked(PollModel.findById).mockReturnValue(query(document) as never)
    jest.mocked(PollModel.updateOne).mockReturnValue(query({ matchedCount: 1 }) as never)

    const repository = new PollRepository()
    const poll = await repository.find('poll-1')
    await expect(repository.save(poll)).resolves.toBeUndefined()

    expect(poll.votes[0]).toEqual({
      id: 'vote-1',
      memberId: 'member-1',
      activityId: 'activity-1',
      votedAt,
    })
    expect(PollModel.updateOne).toHaveBeenCalledWith(
      {
        _id: 'poll-1',
        $or: [{ __v: 0 }, { __v: { $exists: false } }],
      },
      {
        $set: {
          name: 'Nome',
          title: 'Título',
          description: 'Descrição',
          photos: [],
          expiresAt: expect.any(Date),
          active: true,
          votes: [{ _id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt }],
        },
        $inc: { __v: 1 },
      },
    )
  })

  it('returns an existing default poll without creating another document', async () => {
    const document = {
      _id: 'poll-1',
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
      votes: [],
      photos: [],
      expiresAt: new Date(Date.now() + 60_000),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    }
    jest.mocked(PollModel.findOne).mockReturnValue(query(document) as never)

    await expect(new PollRepository().findOrCreateDefault()).resolves.toMatchObject({ id: 'poll-1' })

    expect(PollModel.create).not.toHaveBeenCalled()
  })

  it('rejects saving a stale poll version', async () => {
    const poll = PollFactory.create('Nome', 'Título', 'Descrição', [], 'poll-1')
    jest.mocked(PollModel.updateOne).mockReturnValue(query({ matchedCount: 0 }) as never)

    await expect(new PollRepository().save(poll)).rejects.toThrow('The entity was changed by another operation.')
  })

  it('lists polls and finds the newest available active poll', async () => {
    const active = PollFactory.create(
      'Ativa',
      'Título',
      'Descrição',
      [],
      'poll-active',
      undefined,
      undefined,
      undefined,
      [],
      new Date(Date.now() + 60_000),
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
      new Date(Date.now() - 60_000),
    )
    const docs = [
      {
        _id: active.id,
        name: active.name,
        title: active.title,
        description: active.description,
        votes: [],
        photos: [],
        expiresAt: active.expiresAt,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
      {
        _id: expired.id,
        name: expired.name,
        title: expired.title,
        description: expired.description,
        votes: [],
        photos: [],
        expiresAt: expired.expiresAt,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      },
    ]
    jest.mocked(PollModel.find).mockReturnValue({
      sort: jest.fn().mockReturnValue(query(docs)),
    } as never)
    jest.mocked(PollModel.findOne).mockReturnValue(query(docs[0]) as never)

    await expect(new PollRepository().findAll()).resolves.toHaveLength(2)
    await expect(new PollRepository().findActive()).resolves.toMatchObject({ id: active.id })
    expect(PollModel.updateOne).not.toHaveBeenCalled()
  })

  it('does not create or persist when finding a missing poll', async () => {
    jest.mocked(PollModel.findById).mockReturnValue(query(null) as never)

    await expect(new PollRepository().find('missing')).rejects.toThrow('Poll not found')

    expect(PollModel.create).not.toHaveBeenCalled()
    expect(PollModel.updateOne).not.toHaveBeenCalled()
  })

  it('creates, finds by id, and deletes polls', async () => {
    const poll = PollFactory.create('Nome', 'Título', 'Descrição', [], 'poll-1').addVote(
      PollFactory.createVote('member-1', 'activity-1'),
    )
    jest
      .mocked(PollModel.create)
      .mockResolvedValue({ _id: poll.id, name: poll.name, title: poll.title, description: poll.description } as never)
    jest.mocked(PollModel.findById).mockReturnValue(
      query({
        _id: poll.id,
        name: poll.name,
        title: poll.title,
        description: poll.description,
        votes: [],
        photos: [],
        expiresAt: poll.expiresAt,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      }) as never,
    )
    jest.mocked(PollModel.deleteOne).mockReturnValue(query({ deletedCount: 1 }) as never)

    await expect(new PollRepository().create(poll)).resolves.toBeUndefined()
    await expect(new PollRepository().find(poll.id)).resolves.toMatchObject({ id: poll.id })
    await expect(new PollRepository().delete(poll.id)).resolves.toBeUndefined()
    expect(PollModel.deleteOne).toHaveBeenCalledWith({ _id: poll.id })
  })

  it('rejects deleting a missing poll', async () => {
    jest.mocked(PollModel.deleteOne).mockReturnValue(query({ deletedCount: 0 }) as never)
    await expect(new PollRepository().delete('missing')).rejects.toThrow('Poll not found to delete')
  })

  it('uses defaults for legacy poll fields and returns no active poll when all are expired', async () => {
    const legacy = {
      _id: 'legacy',
      name: 'Legacy',
      title: 'Título',
      description: 'Descrição',
      votes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    jest.mocked(PollModel.findById).mockReturnValue(query(legacy) as never)
    await expect(new PollRepository().find('legacy')).resolves.toMatchObject({ id: 'legacy', active: false })

    jest.mocked(PollModel.find).mockReturnValue({
      sort: jest.fn().mockReturnValue(query([])),
    } as never)
    await expect(new PollRepository().findActive()).resolves.toBeNull()
  })

  it('lists a poll page with total count', async () => {
    const document = {
      _id: 'poll-page-1',
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
      votes: [],
      photos: [],
      expiresAt: new Date(Date.now() + 60_000),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    }
    jest.mocked(PollModel.find).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue(query([document])),
        }),
      }),
    } as never)
    jest.mocked(PollModel.countDocuments).mockReturnValue(query(4) as never)

    await expect(new PollRepository().findPage(2, 1)).resolves.toMatchObject({
      items: [{ id: 'poll-page-1' }],
      totalItems: 4,
    })
  })
})
