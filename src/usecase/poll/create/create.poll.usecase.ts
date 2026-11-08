import PollFactory from '@/domain/poll/factory/poll.factory'
import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import { InputCreatePollDto, OutputCreatePollDto } from './create.poll.dto'
import { toPollOutput } from '../poll.dto'

export default class CreatePollUseCase {
  constructor(private readonly pollRepository: PollRepositoryInterface) {}

  async execute(input: InputCreatePollDto): Promise<OutputCreatePollDto> {
    const existingPolls = await this.pollRepository.findAll()
    for (const existing of existingPolls) {
      if (existing.active) {
        await this.pollRepository.save(existing.deactivate())
      }
    }
    const poll = PollFactory.create(
      input.name,
      input.title,
      input.description,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      input.photos,
      input.expiresAt,
      true,
    )
    const createdPoll = poll.replacePhotos(input.photos ?? [])
    await this.pollRepository.create(createdPoll)
    return toPollOutput(createdPoll)
  }
}
