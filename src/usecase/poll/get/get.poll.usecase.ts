import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import { OutputGetPollDto } from './get.poll.dto'

export default class GetPollUseCase {
  private pollRepository: PollRepositoryInterface

  constructor(pollRepository: PollRepositoryInterface) {
    this.pollRepository = pollRepository
  }

  async execute(): Promise<OutputGetPollDto> {
    const poll = await this.pollRepository.findOrCreateDefault()

    return {
      id: poll.id,
      name: poll.name,
      title: poll.title,
      description: poll.description,
      votes: [...poll.votes],
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
    }
  }
}
