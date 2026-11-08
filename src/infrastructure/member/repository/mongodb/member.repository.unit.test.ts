import Member from '@/domain/member/entity/member'
import Database from '@/lib/database'
import MemberRepository from './member.repository'
import { MemberModel } from './model/member.model'

jest.mock('./model/member.model', () => ({
  MemberModel: {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}))

const query = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
})

describe('MemberRepository', () => {
  beforeEach(() => {
    jest.spyOn(Database, 'connect').mockResolvedValue({} as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('creates a member through the model', async () => {
    const member = new Member('Guilherme', 'member-1')

    await expect(new MemberRepository().create(member)).resolves.toBeUndefined()
    expect(MemberModel.create).toHaveBeenCalledWith({ _id: 'member-1', name: 'Guilherme', active: true })
  })

  it('finds and lists member documents', async () => {
    jest.mocked(MemberModel.findById).mockReturnValue(query({ _id: 'member-1', name: 'Guilherme' }) as never)
    jest.mocked(MemberModel.find).mockReturnValue(
      query([
        { _id: 'member-1', name: 'Guilherme' },
        { _id: 'member-2', name: 'Ana' },
      ]) as never,
    )

    await expect(new MemberRepository().find('member-1')).resolves.toEqual(new Member('Guilherme', 'member-1'))
    await expect(new MemberRepository().findAll()).resolves.toEqual([
      new Member('Guilherme', 'member-1'),
      new Member('Ana', 'member-2'),
    ])
  })

  it('lists a page and defaults legacy members to active', async () => {
    jest.mocked(MemberModel.find).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue(query([{ _id: 'member-3', name: 'Legacy' }])),
        }),
      }),
    } as never)
    jest.mocked(MemberModel.countDocuments).mockReturnValue(query(3) as never)

    await expect(new MemberRepository().findPage(2, 1)).resolves.toEqual({
      items: [new Member('Legacy', 'member-3')],
      totalItems: 3,
    })
  })

  it('updates and deletes a member', async () => {
    const member = new Member('Guilherme', 'member-1')
    jest.mocked(MemberModel.updateOne).mockReturnValue(query({ matchedCount: 1 }) as never)
    jest.mocked(MemberModel.deleteOne).mockReturnValue(query({ deletedCount: 1 }) as never)

    await expect(new MemberRepository().update(member)).resolves.toBeUndefined()
    await expect(new MemberRepository().delete('member-1')).resolves.toBeUndefined()
    expect(MemberModel.updateOne).toHaveBeenCalledWith(
      { _id: 'member-1' },
      { name: 'Guilherme', image: undefined, active: true },
    )
    expect(MemberModel.deleteOne).toHaveBeenCalledWith({ _id: 'member-1' })
  })

  it('reports missing members', async () => {
    const member = new Member('Guilherme', 'member-1')
    jest.mocked(MemberModel.findById).mockReturnValue(query(null) as never)
    jest.mocked(MemberModel.updateOne).mockReturnValue(query({ matchedCount: 0 }) as never)
    jest.mocked(MemberModel.deleteOne).mockReturnValue(query({ deletedCount: 0 }) as never)

    await expect(new MemberRepository().find('member-1')).rejects.toThrow('Member not found')
    await expect(new MemberRepository().update(member)).rejects.toThrow('Member not found to update')
    await expect(new MemberRepository().delete('member-1')).rejects.toThrow('Member not found to delete')
  })
})
