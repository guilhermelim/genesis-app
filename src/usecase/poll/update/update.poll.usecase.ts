import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import { InputUpdatePollDto, OutputUpdatePollDto } from './update.poll.dto'

export default class UpdatePollUseCase {
  private pollRepository: PollRepositoryInterface

  constructor(pollRepository: PollRepositoryInterface) {
    this.pollRepository = pollRepository
  }

  async execute(input: InputUpdatePollDto): Promise<OutputUpdatePollDto> {
    const poll = input.id ? await this.pollRepository.find(input.id) : await this.pollRepository.findOrCreateDefault()

    let updatedPoll = poll.updateDetails(
      input.name || poll.name,
      input.title || poll.title,
      input.description || poll.description,
      input.expiresAt,
    )
    if (input.photos) updatedPoll = updatedPoll.replacePhotos(input.photos)

    await this.pollRepository.save(updatedPoll)

    return {
      id: updatedPoll.id,
      name: updatedPoll.name,
      title: updatedPoll.title,
      description: updatedPoll.description,
      votes: [...updatedPoll.votes],
      createdAt: updatedPoll.createdAt,
      updatedAt: updatedPoll.updatedAt,
      expiresAt: updatedPoll.expiresAt,
      active: updatedPoll.active,
      photos: [...updatedPoll.photos],
    }
  }
}
