import type { PollActivity } from '../types/poll-activity.types'
import type { PollMember } from '../types/poll-member.types'
import type { PollViewModel, PollVoteRecord } from '../types/poll-view-model.types'

export function getPollVoteRecords(
  poll: Pick<PollViewModel, 'votes'>,
  members: PollMember[],
  activities: PollActivity[],
): PollVoteRecord[] {
  return poll.votes.map(vote => ({
    ...vote,
    member: members.find(member => member.id === vote.memberId),
    activity: activities.find(activity => activity.id === vote.activityId),
  }))
}

export function getNextPollExpiration(
  settings: { weekday: number; hour: number; minute: number },
  now = new Date(),
): Date {
  const date = new Date(now)
  date.setDate(date.getDate() + ((settings.weekday - date.getDay() + 7) % 7))
  date.setHours(settings.hour, settings.minute, 0, 0)
  return date
}
