import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import { OutputClearVotesPollDto } from './clear-votes.poll.dto'

export default class ClearVotesPollUseCase {
  private pollRepository: PollRepositoryInterface

  constructor(pollRepository: PollRepositoryInterface) {
    this.pollRepository = pollRepository
  }

  async execute(id?: string): Promise<OutputClearVotesPollDto> {
    const poll = id ? await this.pollRepository.find(id) : await this.pollRepository.findOrCreateDefault()

    const clearedPoll = poll.clearVotes()
    await this.pollRepository.save(clearedPoll)

    return {
      id: clearedPoll.id,
      name: clearedPoll.name,
      title: clearedPoll.title,
      description: clearedPoll.description,
      votes: [...clearedPoll.votes],
      createdAt: clearedPoll.createdAt,
      updatedAt: clearedPoll.updatedAt,
    }
  }
}
