import PollRepositoryInterface, { PollPage } from '@/domain/poll/repository/poll-repository.interface'
import Poll from '@/domain/poll/entity/poll'
import { PollDocument, PollModel, VoteDocument } from './model/poll.model'
import Database from '@/lib/database'
import PollFactory from '@/domain/poll/factory/poll.factory'
import ConcurrencyError from '@/domain/@shared/errors/concurrency-error'

export default class PollRepository implements PollRepositoryInterface {
  private map(doc: PollDocument): Poll {
    return new Poll(
      doc.name,
      doc.title,
      doc.description,
      doc._id.toString(),
      doc.votes.map((vote: VoteDocument) => ({
        id: vote._id,
        memberId: vote.memberId,
        activityId: vote.activityId,
        votedAt: vote.votedAt,
      })),
      doc.createdAt,
      doc.updatedAt,
      doc.__v ?? 0,
      (doc.photos ?? []).map(photo => ({ id: photo._id, dataUrl: photo.dataUrl, isPrimary: photo.isPrimary })),
      new Date(doc.expiresAt ?? new Date()),
      doc.active ?? true,
    )
  }

  private mapWithCurrentState(doc: PollDocument): Poll {
    const poll = this.map(doc)
    return poll.expireIfNeeded()
  }

  async find(id: string): Promise<Poll> {
    await Database.connect()
    const doc = await PollModel.findById(id).exec()
    if (!doc) {
      throw new Error('Poll not found')
    }
    return this.mapWithCurrentState(doc)
  }

  async findOrCreateDefault(): Promise<Poll> {
    await Database.connect()
    let doc = await PollModel.findOne().exec()
    if (!doc) {
      const defaultPoll = PollFactory.createDefault()
      doc = await PollModel.create({
        ...this.toDocument(defaultPoll),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
    }
    return this.mapWithCurrentState(doc)
  }

  async findActive(): Promise<Poll | null> {
    await Database.connect()
    const docs = await PollModel.find({ $or: [{ active: true }, { active: { $exists: false } }] })
      .sort({ createdAt: -1 })
      .exec()
    const polls = docs.map(doc => this.mapWithCurrentState(doc))
    return polls.find(poll => poll.isAvailable()) ?? null
  }

  async findAll(): Promise<Poll[]> {
    await Database.connect()
    const docs = await PollModel.find().sort({ createdAt: -1 }).exec()
    return docs.map(doc => this.mapWithCurrentState(doc))
  }

  async findPage(page: number, pageSize: number): Promise<PollPage> {
    await Database.connect()
    const skip = (page - 1) * pageSize
    const [docs, totalItems] = await Promise.all([
      PollModel.find().sort({ createdAt: -1, _id: -1 }).skip(skip).limit(pageSize).exec(),
      PollModel.countDocuments().exec(),
    ])
    return {
      items: docs.map(doc => this.mapWithCurrentState(doc)),
      totalItems,
    }
  }

  async create(poll: Poll): Promise<void> {
    await Database.connect()
    await PollModel.create(this.toDocument(poll))
  }

  async save(poll: Poll): Promise<void> {
    await Database.connect()

    const updateData = {
      name: poll.name,
      title: poll.title,
      description: poll.description,
      votes: poll.votes.map(vote => ({
        _id: vote.id,
        memberId: vote.memberId,
        activityId: vote.activityId,
        votedAt: vote.votedAt,
      })),
      photos: poll.photos.map(photo => ({ _id: photo.id, dataUrl: photo.dataUrl, isPrimary: photo.isPrimary })),
      expiresAt: poll.expiresAt,
      active: poll.active,
    }

    const result = await PollModel.updateOne(
      {
        _id: poll.id,
        $or: [{ __v: poll.version }, { __v: { $exists: false } }],
      },
      { $set: updateData, $inc: { __v: 1 } },
    ).exec()

    if (result.matchedCount === 0) {
      throw new ConcurrencyError()
    }
  }

  async delete(id: string): Promise<void> {
    await Database.connect()
    const result = await PollModel.deleteOne({ _id: id }).exec()
    if (result.deletedCount === 0) throw new Error('Poll not found to delete')
  }

  private toDocument(poll: Poll) {
    return {
      _id: poll.id,
      name: poll.name,
      title: poll.title,
      description: poll.description,
      votes: poll.votes.map(vote => ({
        _id: vote.id,
        memberId: vote.memberId,
        activityId: vote.activityId,
        votedAt: vote.votedAt,
      })),
      photos: poll.photos.map(photo => ({ _id: photo.id, dataUrl: photo.dataUrl, isPrimary: photo.isPrimary })),
      expiresAt: poll.expiresAt,
      active: poll.active,
    }
  }
}
