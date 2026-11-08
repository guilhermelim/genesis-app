import PollFactory from '@/domain/poll/factory/poll.factory'
import Member from '@/domain/member/entity/member'
import { revalidatePath } from 'next/cache'
import PollRepository from './repository/mongodb/poll.repository'
import {
  activatePoll,
  addVote,
  clearVotes,
  createPoll,
  deletePoll,
  getActivePoll,
  getPoll,
  listPolls,
  listPollsPage,
  updatePoll,
} from './poll.actions'
import MemberRepository from '@/infrastructure/member/repository/mongodb/member.repository'
import ActivityRepository from '@/infrastructure/activity/repository/mongodb/activity.repository'
import Activity from '@/domain/activity/entity/activity'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

describe('poll Server Actions', () => {
  afterEach(() => jest.restoreAllMocks())

  it('executes reads and mutations through the repository', async () => {
    const poll = PollFactory.create(
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
    )
    jest.spyOn(PollRepository.prototype, 'find').mockResolvedValue(poll)
    jest.spyOn(PollRepository.prototype, 'findOrCreateDefault').mockResolvedValue(poll)
    jest.spyOn(PollRepository.prototype, 'save').mockResolvedValue()
    jest.spyOn(MemberRepository.prototype, 'find').mockResolvedValue(new Member('Guilherme', 'member-1'))
    jest
      .spyOn(ActivityRepository.prototype, 'find')
      .mockResolvedValue(new Activity('Atividade', 'Descrição', '1', 'activity-1'))

    await expect(getPoll()).resolves.toMatchObject({ id: 'poll-1', name: 'Nome' })
    await expect(addVote({ id: 'poll-1', memberId: 'member-1', activityId: 'activity-1' })).resolves.toMatchObject({
      success: true,
      data: { votes: [{ memberId: 'member-1', activityId: 'activity-1' }] },
    })
    await expect(updatePoll({ title: 'Novo título' })).resolves.toMatchObject({
      success: true,
      data: { title: 'Novo título' },
    })
    await expect(clearVotes()).resolves.toMatchObject({ success: true, data: { votes: [] } })
    await expect(clearVotes('poll-1')).resolves.toMatchObject({ success: true, data: { votes: [] } })
  })

  it('executes poll lifecycle actions', async () => {
    const poll = PollFactory.create(
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
    )
    jest.spyOn(PollRepository.prototype, 'find').mockResolvedValue(poll)
    jest.spyOn(PollRepository.prototype, 'findAll').mockResolvedValue([poll])
    jest.spyOn(PollRepository.prototype, 'findActive').mockResolvedValue(poll)
    jest.spyOn(PollRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(PollRepository.prototype, 'save').mockResolvedValue()
    jest.spyOn(PollRepository.prototype, 'delete').mockResolvedValue()

    await expect(getActivePoll()).resolves.toMatchObject({ id: 'poll-1' })
    await expect(getActivePoll()).resolves.not.toBeNull()
    await expect(listPolls()).resolves.toHaveLength(1)
    jest.spyOn(PollRepository.prototype, 'findPage').mockResolvedValue({ items: [poll], totalItems: 1 })
    await expect(listPollsPage({ page: 1, pageSize: 10 })).resolves.toMatchObject({
      page: 1,
      pageSize: 10,
      totalItems: 1,
      items: [{ id: 'poll-1' }],
    })
    await expect(
      createPoll({
        name: 'Novo',
        title: 'Título',
        description: 'Descrição',
        expiresAt: new Date(Date.now() + 60_000),
        photos: [],
      }),
    ).resolves.toMatchObject({ success: true })
    await expect(activatePoll('poll-1')).resolves.toMatchObject({ success: true })
    await expect(deletePoll('poll-1')).resolves.toMatchObject({ success: true, data: { id: 'poll-1' } })
  })

  it('returns null when there is no active poll', async () => {
    jest.spyOn(PollRepository.prototype, 'findActive').mockResolvedValue(null)
    await expect(getActivePoll()).resolves.toBeNull()
  })

  it.each([
    ['addVote', () => addVote({ memberId: '', activityId: 'activity-1' })],
    ['updatePoll', () => updatePoll({ name: '' })],
  ])('%s returns a validation error', async (_, action) => {
    await expect(action()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
  })

  it('rejects invalid pagination input', async () => {
    await expect(listPollsPage({ page: 0, pageSize: 10 })).rejects.toThrow()
    await expect(listPollsPage({ page: 1, pageSize: 101 })).rejects.toThrow()
  })

  it.each([
    ['createPoll', () => createPoll({ name: '', title: 'Título', description: 'Descrição', expiresAt: new Date() })],
    ['activatePoll', () => activatePoll('')],
    ['deletePoll', () => deletePoll('')],
  ])('%s returns a validation error', async (_, action) => {
    await expect(action()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
  })

  it('revalidates poll paths after mutations', async () => {
    const poll = PollFactory.create(
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
    )
    jest.spyOn(PollRepository.prototype, 'find').mockResolvedValue(poll)
    jest.spyOn(PollRepository.prototype, 'save').mockResolvedValue()
    jest.spyOn(MemberRepository.prototype, 'find').mockResolvedValue(new Member('Guilherme', 'member-1'))
    jest
      .spyOn(ActivityRepository.prototype, 'find')
      .mockResolvedValue(new Activity('Atividade', 'Descrição', '1', 'activity-1'))

    await addVote({ id: 'poll-1', memberId: 'member-1', activityId: 'activity-1' })

    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
  })
})
