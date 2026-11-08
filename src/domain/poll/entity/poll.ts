import PollInterface from './poll.interface'
import Vote from './vote.interface'
import DomainError from '@/domain/@shared/errors/domain-error'
import PollPhoto from './poll-photo.interface'
export default class Poll implements PollInterface {
  private _id: string
  private _name: string
  private _title: string
  private _description: string
  private _votes: Vote[]
  private _createdAt: Date
  private _updatedAt: Date
  private _version: number
  private _photos: PollPhoto[]
  private _expiresAt: Date
  private _active: boolean

  constructor(
    name: string,
    title: string,
    description: string,
    id: string,
    votes?: Vote[],
    createdAt?: Date,
    updatedAt?: Date,
    version = 0,
    photos: PollPhoto[] = [],
    expiresAt = new Date(),
    active = true,
  ) {
    this._id = id
    this._name = name
    this._title = title
    this._description = description
    this._votes = (votes || []).map(vote => ({ ...vote, votedAt: new Date(vote.votedAt) }))
    this._createdAt = new Date((createdAt || new Date()).getTime())
    this._updatedAt = new Date((updatedAt || new Date()).getTime())
    this._version = version
    this._photos = photos.map(photo => ({ ...photo }))
    this._expiresAt = new Date(expiresAt.getTime())
    this._active = active

    this.validate()
    Object.freeze(this)
  }

  private validate(): boolean {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainError('Name is required.')
    }

    if (!this._title || this._title.trim().length === 0) {
      throw new DomainError('Title is required.')
    }

    if (!this._id || this._id.trim().length === 0) {
      throw new DomainError('Invalid ID.')
    }

    return true
  }

  updateDetails(name: string, title: string, description: string, expiresAt = this._expiresAt): Poll {
    return this.copy({
      name,
      title,
      description,
      expiresAt,
      active: expiresAt.getTime() > new Date().getTime() && this._active,
    })
  }

  addVote(vote: Vote): Poll {
    // Validate that member hasn't already voted
    const existingMemberVote = this._votes.find((v: Vote) => v.memberId === vote.memberId)
    if (existingMemberVote) {
      throw new DomainError('Member has already voted.', 'MEMBER_ALREADY_VOTED')
    }

    // Validate that activity isn't already taken
    const existingActivityVote = this._votes.find((v: Vote) => v.activityId === vote.activityId)
    if (existingActivityVote) {
      throw new DomainError('Activity has already been selected.', 'ACTIVITY_ALREADY_SELECTED')
    }

    return this.copy({ votes: [...this._votes, vote] })
  }

  clearVotes(): Poll {
    return this.copy({ votes: [] })
  }

  activate(at = new Date()): Poll {
    if (this._expiresAt.getTime() <= at.getTime()) {
      throw new DomainError('Cannot activate a poll with an expired expiration date.', 'POLL_EXPIRATION_DATE_PASSED')
    }
    return this.copy({ active: true })
  }

  deactivate(): Poll {
    return this.copy({ active: false })
  }

  replacePhotos(photos: PollPhoto[]): Poll {
    if (photos.length > 10) {
      throw new DomainError('An enquête can have at most 10 photos.', 'POLL_PHOTO_LIMIT')
    }
    if (photos.some(photo => !photo.dataUrl.startsWith('data:image/'))) {
      throw new DomainError('Poll photos must be valid image data.', 'INVALID_POLL_PHOTO')
    }
    const primaryIndex = photos.findIndex(photo => photo.isPrimary)
    const normalizedPhotos = photos.map((photo, index) => ({
      ...photo,
      isPrimary: primaryIndex < 0 ? index === 0 : index === primaryIndex,
    }))
    return this.copy({ photos: normalizedPhotos })
  }

  isAvailable(at = new Date()): boolean {
    return this._active && this._expiresAt.getTime() > at.getTime()
  }

  expireIfNeeded(at = new Date()): Poll {
    if (this._active && this._expiresAt.getTime() <= at.getTime()) {
      return this.deactivate()
    }
    return this
  }

  private copy(changes: {
    name?: string
    title?: string
    description?: string
    votes?: Vote[]
    photos?: PollPhoto[]
    expiresAt?: Date
    active?: boolean
  }): Poll {
    return new Poll(
      changes.name ?? this._name,
      changes.title ?? this._title,
      changes.description ?? this._description,
      this._id,
      changes.votes ?? this._votes,
      this._createdAt,
      new Date(),
      this._version,
      changes.photos ?? this._photos,
      changes.expiresAt ?? this._expiresAt,
      changes.active ?? this._active,
    )
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get title(): string {
    return this._title
  }

  get description(): string {
    return this._description
  }

  get photos(): readonly PollPhoto[] {
    return this._photos.map(photo => ({ ...photo }))
  }

  get expiresAt(): Date {
    return new Date(this._expiresAt.getTime())
  }

  get active(): boolean {
    return this._active
  }

  get votes(): readonly Vote[] {
    return this._votes.map(vote => ({ ...vote, votedAt: new Date(vote.votedAt) }))
  }

  get createdAt(): Date {
    return new Date(this._createdAt.getTime())
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt.getTime())
  }

  get version(): number {
    return this._version
  }
}
