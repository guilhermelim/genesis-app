import type { PollViewModel } from '../types/poll-view-model.types'

export function isPollExpired(expiresAt?: Date, now = new Date()): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime())
}

export function isPollAvailable(poll: Pick<PollViewModel, 'active' | 'expiresAt'>, now = new Date()): boolean {
  return Boolean(poll.active && poll.expiresAt && !isPollExpired(poll.expiresAt, now))
}
