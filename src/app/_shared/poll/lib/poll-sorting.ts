import type { PollActivity } from '../types/poll-activity.types'
import type { PollMember } from '../types/poll-member.types'

export function sortPollMembers(members: PollMember[]): PollMember[] {
  return [...members].sort(
    (a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base', numeric: true }) || a.id.localeCompare(b.id),
  )
}

export function getAvailablePollMembers(members: PollMember[], votedMemberIds: Set<string>): PollMember[] {
  return sortPollMembers(members.filter(member => member.active && !votedMemberIds.has(member.id)))
}

export function getAvailablePollActivities(activities: PollActivity[], votedActivityIds: Set<string>): PollActivity[] {
  return activities.filter(activity => !votedActivityIds.has(activity.id))
}
