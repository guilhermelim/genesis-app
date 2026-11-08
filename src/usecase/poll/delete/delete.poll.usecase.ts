import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'

export default class DeletePollUseCase {
  constructor(private readonly pollRepository: PollRepositoryInterface) {}
  async execute(id: string): Promise<{ id: string }> {
    await this.pollRepository.delete(id)
    return { id }
  }
}
