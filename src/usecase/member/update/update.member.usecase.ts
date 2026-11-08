import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import { InputUpdateMemberDto, OutputUpdateMemberDto } from './update.member.dto'
import MemberFactory from '@/domain/member/factory/member.factory'

export default class UpdateMemberUseCase {
  private memberRepository: MemberRepositoryInterface

  constructor(memberRepository: MemberRepositoryInterface) {
    this.memberRepository = memberRepository
  }

  async execute(input: InputUpdateMemberDto): Promise<OutputUpdateMemberDto> {
    const member = MemberFactory.create(input.name, input.id, input.image, input.active)

    await this.memberRepository.update(member)

    return {
      id: member.id,
      name: member.name,
      image: member.image,
      active: member.active,
    }
  }
}
