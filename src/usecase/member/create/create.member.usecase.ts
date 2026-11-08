import MemberRepositoryInterface from '@/domain/member/repository/member-repository.interface'
import MemberFactory from '@/domain/member/factory/member.factory'
import { InputCreateMemberDto, OutputCreateMemberDto } from './create.member.dto'

export default class CreateMemberUseCase {
  private memberRepository: MemberRepositoryInterface

  constructor(memberRepository: MemberRepositoryInterface) {
    this.memberRepository = memberRepository
  }

  async execute(input: InputCreateMemberDto): Promise<OutputCreateMemberDto> {
    const member = MemberFactory.create(input.name, undefined, input.image, input.active ?? true)

    await this.memberRepository.create(member)

    return {
      id: member.id,
      name: member.name,
      image: member.image,
      active: member.active,
    }
  }
}
