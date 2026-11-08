import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import PollVotingService from '@/domain/poll/service/poll-voting.service'
import { InputAddVotePollDto, OutputAddVotePollDto } from './add-vote.poll.dto'

export default class AddVotePollUseCase {
  private pollRepository: PollRepositoryInterface
  private memberRepository: MemberRepositoryInterface
  private activityRepository: ActivityRepositoryInterface
  private pollVotingService: PollVotingService

  constructor(
    pollRepository: PollRepositoryInterface,
    memberRepository: MemberRepositoryInterface,
    activityRepository: ActivityRepositoryInterface,
    pollVotingService: PollVotingService,
  ) {
    this.pollRepository = pollRepository
    this.memberRepository = memberRepository
    this.activityRepository = activityRepository
    this.pollVotingService = pollVotingService
  }

  async execute(input: InputAddVotePollDto): Promise<OutputAddVotePollDto> {
    const poll = input.id ? await this.pollRepository.find(input.id) : await this.pollRepository.findOrCreateDefault()
    const member = await this.memberRepository.find(input.memberId)
    const activity = await this.activityRepository.find(input.activityId)
    const updatedPoll = this.pollVotingService.registerVote(poll, member, activity)

    await this.pollRepository.save(updatedPoll)

    return {
      id: updatedPoll.id,
      name: updatedPoll.name,
      title: updatedPoll.title,
      description: updatedPoll.description,
      votes: [...updatedPoll.votes],
      createdAt: updatedPoll.createdAt,
      updatedAt: updatedPoll.updatedAt,
      version: updatedPoll.version,
      expiresAt: updatedPoll.expiresAt,
      active: updatedPoll.active,
      photos: [...updatedPoll.photos],
    }
  }
}
