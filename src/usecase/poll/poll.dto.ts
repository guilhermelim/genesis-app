import Poll from '@/domain/poll/entity/poll'

export interface PollOutput {
  id: string
  name: string
  title: string
  description: string
  votes: Array<{ id: string; memberId: string; activityId: string; votedAt: Date }>
  photos: Array<{ id: string; dataUrl: string; isPrimary: boolean }>
  expiresAt: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InputListPollPageDto {
  page: number
  pageSize: number
}

export interface OutputListPollPageDto {
  items: PollOutput[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export function toPollOutput(poll: Poll): PollOutput {
  return {
    id: poll.id,
    name: poll.name,
    title: poll.title,
    description: poll.description,
    votes: [...poll.votes],
    photos: [...poll.photos],
    expiresAt: poll.expiresAt,
    active: poll.active,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
  }
}
