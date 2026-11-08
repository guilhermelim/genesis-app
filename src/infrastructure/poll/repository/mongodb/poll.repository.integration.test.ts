import Database from '@/lib/database'
import PollRepository from './poll.repository'
import { PollModel } from './model/poll.model'

describe('PollRepository integration', () => {
  beforeEach(async () => {
    await Database.connect()
    await PollModel.deleteMany({})
  })

  afterEach(async () => {
    await PollModel.deleteMany({})
  })

  afterAll(async () => {
    await Database.close()
  })

  it('creates a default poll when persistence is empty', async () => {
    const poll = await new PollRepository().findOrCreateDefault()

    expect(await PollModel.countDocuments()).toBe(1)
    expect(poll.name).toBe('Voluntariado Principal')
    expect(poll.votes).toEqual([])
  })

  it('reconstitutes and saves an existing poll with votes', async () => {
    const votedAt = new Date('2026-01-01T00:00:00.000Z')
    await PollModel.create({
      _id: 'poll-1',
      name: 'Nome',
      title: 'Título',
      description: 'Descrição',
      votes: [{ _id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt }],
      createdAt: votedAt,
      updatedAt: votedAt,
    })

    const repository = new PollRepository()
    const restored = await repository.find('poll-1')
    await repository.save(restored)

    expect(restored.votes[0]).toEqual({
      id: 'vote-1',
      memberId: 'member-1',
      activityId: 'activity-1',
      votedAt,
    })
    await expect(PollModel.findById('poll-1').lean()).resolves.toMatchObject({
      _id: 'poll-1',
      votes: [{ _id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt }],
    })
  })
})
