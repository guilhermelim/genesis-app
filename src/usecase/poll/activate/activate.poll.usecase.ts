import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import { PollOutput, toPollOutput } from '../poll.dto'

export default class ActivatePollUseCase {
  constructor(private readonly pollRepository: PollRepositoryInterface) {}
  async execute(id: string): Promise<PollOutput> {
    const polls = await this.pollRepository.findAll()
    const target = await this.pollRepository.find(id)
    const activatedTarget = target.activate()
    for (const poll of polls) {
      if (poll.id !== id && poll.active) {
        await this.pollRepository.save(poll.deactivate())
      }
    }
    await this.pollRepository.save(activatedTarget)
    return toPollOutput(activatedTarget)
  }
}
