'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import MemberRepository from './repository/mongodb/member.repository'
import CreateMemberUseCase from '@/usecase/member/create/create.member.usecase'
import DeleteMemberUseCase from '@/usecase/member/delete/delete.member.usecase'
import FindMemberUseCase from '@/usecase/member/find/find.member.usecase'
import ListMemberUseCase from '@/usecase/member/list/list.member.usecase'
import UpdateMemberUseCase from '@/usecase/member/update/update.member.usecase'
import { ActionResult, runAction } from '@/infrastructure/action-result'
import { InputListMemberPageDto } from '@/usecase/member/list/list.member.dto'

const memberSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1),
  image: z.string().max(2_000_000).optional(),
  active: z.boolean().default(true),
})

export async function listMembers() {
  const repository = new MemberRepository()
  const usecase = new ListMemberUseCase(repository)
  return usecase.execute()
}

export async function listMembersPage(input: InputListMemberPageDto) {
  const parsed = z
    .object({
      page: z.number().int().min(1),
      pageSize: z.number().int().min(1).max(100),
    })
    .parse(input)
  const repository = new MemberRepository()
  const usecase = new ListMemberUseCase(repository)
  return usecase.executePage(parsed)
}

export async function findMember(id: string) {
  const repository = new MemberRepository()
  const usecase = new FindMemberUseCase(repository)
  return usecase.execute({ id: z.string().min(1).parse(id) })
}

export async function createMember(input: {
  name: string
  image?: string
  active?: boolean
}): Promise<ActionResult<Awaited<ReturnType<CreateMemberUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new MemberRepository()
    const usecase = new CreateMemberUseCase(repository)
    const output = await usecase.execute(memberSchema.omit({ id: true }).parse(input))

    revalidatePath('/admin')
    revalidatePath('/')
    return output
  })
}

export async function updateMember(input: {
  id: string
  name: string
  image?: string
  active: boolean
}): Promise<ActionResult<Awaited<ReturnType<UpdateMemberUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new MemberRepository()
    const usecase = new UpdateMemberUseCase(repository)
    const output = await usecase.execute(memberSchema.extend({ id: z.string().min(1) }).parse(input))

    revalidatePath('/admin')
    revalidatePath('/')
    return output
  })
}

export async function deleteMember(id: string): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const repository = new MemberRepository()
    const usecase = new DeleteMemberUseCase(repository)
    await usecase.execute({ id: z.string().min(1).parse(id) })

    revalidatePath('/admin')
    return { id }
  })
}
