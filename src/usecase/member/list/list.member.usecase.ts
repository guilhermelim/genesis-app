import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import { InputListMemberPageDto, OutputListMemberDto, OutputListMemberPageDto } from './list.member.dto'

export default class ListMemberUseCase {
  private memberRepository: MemberRepositoryInterface

  constructor(memberRepository: MemberRepositoryInterface) {
    this.memberRepository = memberRepository
  }

  async execute(): Promise<OutputListMemberDto[]> {
    const members = await this.memberRepository.findAll()

    return members.map(member => ({
      id: member.id,
      name: member.name,
      image: member.image,
      active: member.active,
    }))
  }

  async executePage(input: InputListMemberPageDto): Promise<OutputListMemberPageDto> {
    const page = Math.max(1, Math.floor(input.page))
    const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize)))
    const result = await this.memberRepository.findPage(page, pageSize)
    const totalPages = Math.max(1, Math.ceil(result.totalItems / pageSize))
    const normalizedPage = Math.min(page, totalPages)
    const normalizedResult =
      normalizedPage === page ? result : await this.memberRepository.findPage(normalizedPage, pageSize)

    return {
      items: normalizedResult.items.map(member => ({
        id: member.id,
        name: member.name,
        image: member.image,
        active: member.active,
      })),
      page: normalizedPage,
      pageSize,
      totalItems: normalizedResult.totalItems,
      totalPages,
    }
  }
}
