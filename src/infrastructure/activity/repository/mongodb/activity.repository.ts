import ActivityRepositoryInterface, { ActivityPage } from '@/domain/activity/repository/activity-repository.interface'
import Activity from '@/domain/activity/entity/activity'
import { ActivityModel } from './model/activity.model'
import Database from '@/lib/database'

export default class ActivityRepository implements ActivityRepositoryInterface {
  async create(entity: Activity): Promise<void> {
    await Database.connect()
    await ActivityModel.create({
      _id: entity.id,
      label: entity.label,
      name: entity.name,
      description: entity.description,
      iconName: entity.iconName,
    })
  }

  async find(id: string): Promise<Activity> {
    await Database.connect()
    const doc = await ActivityModel.findById(id).exec()
    if (!doc) {
      throw new Error('Activity not found')
    }
    return new Activity(doc.name, doc.description, doc.label, doc._id.toString(), doc.iconName)
  }

  async findAll(): Promise<Activity[]> {
    await Database.connect()
    const docs = await ActivityModel.find().exec()
    return docs.map(doc => new Activity(doc.name, doc.description, doc.label, doc._id.toString(), doc.iconName))
  }

  async findPage(page: number, pageSize: number): Promise<ActivityPage> {
    await Database.connect()
    const skip = (page - 1) * pageSize
    const [activityDocs, totalItems] = await Promise.all([
      ActivityModel.find().sort({ name: 1, _id: 1 }).skip(skip).limit(pageSize).exec(),
      ActivityModel.countDocuments().exec(),
    ])

    return {
      items: activityDocs.map(
        doc => new Activity(doc.name, doc.description, doc.label, doc._id.toString(), doc.iconName),
      ),
      totalItems,
    }
  }

  async update(entity: Activity): Promise<void> {
    await Database.connect()
    const result = await ActivityModel.updateOne(
      { _id: entity.id },
      {
        label: entity.label,
        name: entity.name,
        description: entity.description,
        iconName: entity.iconName,
      },
    ).exec()
    if (result.matchedCount === 0) {
      throw new Error('Activity not found to update')
    }
  }

  async delete(id: string): Promise<void> {
    await Database.connect()
    const result = await ActivityModel.deleteOne({ _id: id }).exec()
    if (result.deletedCount === 0) {
      throw new Error('Activity not found to delete')
    }
  }
}
