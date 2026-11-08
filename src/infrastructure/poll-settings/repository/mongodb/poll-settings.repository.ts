import PollSettings from '@/domain/poll-settings/entity/poll-settings'
import PollSettingsRepositoryInterface from '@/domain/poll-settings/repository/poll-settings-repository.interface'
import Database from '@/lib/database'
import { PollSettingsModel } from './model/poll-settings.model'

export default class PollSettingsRepository implements PollSettingsRepositoryInterface {
  async find(): Promise<PollSettings> {
    await Database.connect()
    const doc = await PollSettingsModel.findById('default').exec()
    if (!doc) {
      const created = await PollSettingsModel.create({ _id: 'default', weekday: 3, hour: 0, minute: 0 })
      return new PollSettings(created._id, created.weekday, created.hour, created.minute)
    }
    return new PollSettings(doc._id, doc.weekday, doc.hour, doc.minute)
  }

  async save(settings: PollSettings): Promise<void> {
    await Database.connect()
    await PollSettingsModel.updateOne(
      { _id: settings.id },
      { weekday: settings.weekday, hour: settings.hour, minute: settings.minute },
      { upsert: true },
    ).exec()
  }
}
