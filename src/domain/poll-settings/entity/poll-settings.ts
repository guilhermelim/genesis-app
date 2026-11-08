import DomainError from '@/domain/@shared/errors/domain-error'

export default class PollSettings {
  constructor(
    public readonly id: string,
    public readonly weekday: number,
    public readonly hour: number,
    public readonly minute: number,
  ) {
    if (!id.trim()) throw new DomainError('Invalid poll settings ID.')
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      throw new DomainError('Invalid poll expiration weekday.')
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new DomainError('Invalid poll expiration hour.')
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new DomainError('Invalid poll expiration minute.')
    }
    Object.freeze(this)
  }
}
