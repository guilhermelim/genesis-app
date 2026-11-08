import type { PollActivity } from './poll-activity.types'
import type { PollMember } from './poll-member.types'
import type { PollVote } from './poll-vote.types'

export interface PollPhoto {
  id: string
  dataUrl: string
  isPrimary: boolean
}

export interface PollViewModel {
  id: string
  name: string
  title: string
  description: string
  votes: PollVote[]
  photos: PollPhoto[]
  expiresAt: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PollVoteRecord extends PollVote {
  member?: PollMember
  activity?: PollActivity
}

export interface PollSettings {
  weekday: number
  hour: number
  minute: number
}
