import Member from '@/domain/member/entity/member'
import Activity from '@/domain/activity/entity/activity'
import Poll from '../entity/poll'
import PollFactory from '../factory/poll.factory'
import DomainError from '@/domain/@shared/errors/domain-error'

export default class PollVotingService {
  registerVote(poll: Poll, member: Member, activity: Activity): Poll {
    if (!member.active) {
      throw new DomainError('Inactive members cannot vote.', 'INACTIVE_MEMBER')
    }

    if (!poll.isAvailable()) {
      throw new DomainError('Votes cannot be registered for an expired poll.', 'POLL_EXPIRED')
    }

    return poll.addVote(PollFactory.createVote(member.id, activity.id))
  }
}
