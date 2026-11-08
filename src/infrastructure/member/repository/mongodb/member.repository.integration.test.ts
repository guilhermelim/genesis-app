import Member from '@/domain/member/entity/member'
import Database from '@/lib/database'
import MemberRepository from './member.repository'
import { MemberModel } from './model/member.model'

describe('MemberRepository integration', () => {
  beforeEach(async () => {
    await Database.connect()
    await MemberModel.deleteMany({})
  })

  afterEach(async () => {
    await MemberModel.deleteMany({})
  })

  afterAll(async () => {
    await Database.close()
  })

  it('reconstitutes a member from the persistence document', async () => {
    const repository = new MemberRepository()
    const member = new Member('Guilherme', 'member-1')

    await repository.create(member)

    await expect(repository.find('member-1')).resolves.toEqual(member)
  })

  it('creates, lists, updates, and deletes members', async () => {
    const repository = new MemberRepository()
    const member = new Member('Guilherme', 'member-1')

    await repository.create(member)
    await expect(repository.findAll()).resolves.toHaveLength(1)
    await repository.update(member)
    await repository.delete('member-1')

    await expect(repository.find('member-1')).rejects.toThrow('Member not found')
  })

  it('returns a sorted page with the total number of members', async () => {
    const repository = new MemberRepository()

    await repository.create(new Member('Carlos', 'member-1'))
    await repository.create(new Member('Ana', 'member-2'))
    await repository.create(new Member('Bruno', 'member-3'))

    await expect(repository.findPage(1, 2)).resolves.toMatchObject({
      totalItems: 3,
      items: [{ name: 'Ana' }, { name: 'Bruno' }],
    })
  })

  it('reports missing members on find, update, and delete', async () => {
    const repository = new MemberRepository()
    const member = new Member('Guilherme', 'member-1')

    await expect(repository.find('member-1')).rejects.toThrow('Member not found')
    await expect(repository.update(member)).rejects.toThrow('Member not found to update')
    await expect(repository.delete('member-1')).rejects.toThrow('Member not found to delete')
  })
})
