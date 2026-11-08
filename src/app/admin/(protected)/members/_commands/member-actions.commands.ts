import { createMember, deleteMember, updateMember } from '@/infrastructure/member/member.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'
import type { MemberFormValues } from '../_forms/member.form/member.schema'
import type { MemberListItemSchemaType } from '../_components/member-list.component.schema'
import type { OutputCreateMemberDto } from '@/usecase/member/create/create.member.dto'
import type { OutputUpdateMemberDto } from '@/usecase/member/update/update.member.dto'

export function createMemberCommand(input: MemberFormValues): Promise<OutputCreateMemberDto> {
  return unwrapActionResult(createMember(input))
}

export function updateMemberCommand(input: MemberListItemSchemaType): Promise<OutputUpdateMemberDto> {
  return unwrapActionResult(updateMember(input))
}

export function deleteMemberCommand(id: string): Promise<{ id: string }> {
  return unwrapActionResult(deleteMember(id))
}
