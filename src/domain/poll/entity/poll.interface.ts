import Vote from './vote.interface'
import PollPhoto from './poll-photo.interface'

export default interface PollInterface {
  updateDetails(name: string, title: string, description: string, expiresAt?: Date): PollInterface
  addVote(vote: Vote): PollInterface
  clearVotes(): PollInterface
  activate(at?: Date): PollInterface
  deactivate(): PollInterface
  replacePhotos(photos: PollPhoto[]): PollInterface
  isAvailable(at?: Date): boolean
  expireIfNeeded(at?: Date): PollInterface

  readonly id: string
  readonly name: string
  readonly title: string
  readonly description: string
  readonly photos: readonly PollPhoto[]
  readonly expiresAt: Date
  readonly active: boolean
  readonly votes: readonly Vote[]
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number
}
