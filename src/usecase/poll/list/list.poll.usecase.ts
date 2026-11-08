import PollRepositoryInterface from '@/domain/poll/repository/poll-repository.interface'
import { InputListPollPageDto, OutputListPollPageDto, PollOutput, toPollOutput } from '../poll.dto'

export default class ListPollUseCase {
  constructor(private readonly pollRepository: PollRepositoryInterface) {}
  async execute(): Promise<PollOutput[]> {
    return (await this.pollRepository.findAll()).map(toPollOutput)
  }

  async executePage(input: InputListPollPageDto): Promise<OutputListPollPageDto> {
    const page = Math.max(1, Math.floor(input.page))
    const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize)))
    const result = await this.pollRepository.findPage(page, pageSize)
    const totalPages = Math.max(1, Math.ceil(result.totalItems / pageSize))
    const normalizedPage = Math.min(page, totalPages)
    const normalizedResult =
      normalizedPage === page ? result : await this.pollRepository.findPage(normalizedPage, pageSize)

    return {
      items: normalizedResult.items.map(toPollOutput),
      page: normalizedPage,
      pageSize,
      totalItems: normalizedResult.totalItems,
      totalPages,
    }
  }
}
