import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import { InputFindMemberDto, OutputFindMemberDto } from './find.member.dto'

export default class FindMemberUseCase {
  private memberRepository: MemberRepositoryInterface

  constructor(memberRepository: MemberRepositoryInterface) {
    this.memberRepository = memberRepository
  }

  async execute(input: InputFindMemberDto): Promise<OutputFindMemberDto> {
    const member = await this.memberRepository.find(input.id)

    return {
      id: member.id,
      name: member.name,
      active: member.active,
    }
  }
}
