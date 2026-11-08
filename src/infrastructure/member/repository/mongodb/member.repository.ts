import MemberRepositoryInterface, { MemberPage } from '@/domain/member/repository/member-repository.interface'
import Member from '@/domain/member/entity/member'
import { MemberModel } from './model/member.model'
import Database from '@/lib/database'

export default class MemberRepository implements MemberRepositoryInterface {
  async create(entity: Member): Promise<void> {
    await Database.connect()
    await MemberModel.create({
      _id: entity.id,
      name: entity.name,
      image: entity.image,
      active: entity.active,
    })
  }

  async find(id: string): Promise<Member> {
    await Database.connect()
    const memberDoc = await MemberModel.findById(id).exec()
    if (!memberDoc) {
      throw new Error('Member not found')
    }
    return new Member(memberDoc.name, memberDoc._id.toString(), memberDoc.image, memberDoc.active ?? true)
  }

  async findAll(): Promise<Member[]> {
    await Database.connect()
    const memberDocs = await MemberModel.find().exec()
    return memberDocs.map(doc => new Member(doc.name, doc._id.toString(), doc.image, doc.active ?? true))
  }

  async findPage(page: number, pageSize: number): Promise<MemberPage> {
    await Database.connect()
    const skip = (page - 1) * pageSize
    const [memberDocs, totalItems] = await Promise.all([
      MemberModel.find().sort({ name: 1, _id: 1 }).skip(skip).limit(pageSize).exec(),
      MemberModel.countDocuments().exec(),
    ])

    return {
      items: memberDocs.map(doc => new Member(doc.name, doc._id.toString(), doc.image, doc.active ?? true)),
      totalItems,
    }
  }

  async update(entity: Member): Promise<void> {
    await Database.connect()
    const result = await MemberModel.updateOne(
      { _id: entity.id },
      { name: entity.name, image: entity.image, active: entity.active },
    ).exec()
    if (result.matchedCount === 0) {
      throw new Error('Member not found to update')
    }
  }

  async delete(id: string): Promise<void> {
    await Database.connect()
    const result = await MemberModel.deleteOne({ _id: id }).exec()
    if (result.deletedCount === 0) {
      throw new Error('Member not found to delete')
    }
  }
}
