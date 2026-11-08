import { listMembersPage } from '@/infrastructure/member/member.actions'

export function listMembersCommand(page: number, pageSize: number): ReturnType<typeof listMembersPage> {
  return listMembersPage({ page, pageSize })
}
