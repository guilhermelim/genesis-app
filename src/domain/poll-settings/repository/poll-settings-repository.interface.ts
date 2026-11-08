import PollSettings from '../entity/poll-settings'

export default interface PollSettingsRepositoryInterface {
  find(): Promise<PollSettings>
  save(settings: PollSettings): Promise<void>
}
