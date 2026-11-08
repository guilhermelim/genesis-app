import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import { InputDeleteMemberDto, OutputDeleteMemberDto } from './delete.member.dto'

export default class DeleteMemberUseCase {
  private memberRepository: MemberRepositoryInterface

  constructor(memberRepository: MemberRepositoryInterface) {
    this.memberRepository = memberRepository
  }

  async execute(input: InputDeleteMemberDto): Promise<OutputDeleteMemberDto> {
    await this.memberRepository.delete(input.id)

    return {
      id: input.id,
    }
  }
}
