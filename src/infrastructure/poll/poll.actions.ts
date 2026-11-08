'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import PollRepository from './repository/mongodb/poll.repository'
import MemberRepository from '@/infrastructure/member/repository/mongodb/member.repository'
import ActivityRepository from '@/infrastructure/activity/repository/mongodb/activity.repository'
import PollVotingService from '@/domain/poll/service/poll-voting.service'
import AddVotePollUseCase from '@/usecase/poll/add-vote/add-vote.poll.usecase'
import ClearVotesPollUseCase from '@/usecase/poll/clear-votes/clear-votes.poll.usecase'
import GetPollUseCase from '@/usecase/poll/get/get.poll.usecase'
import UpdatePollUseCase from '@/usecase/poll/update/update.poll.usecase'
import CreatePollUseCase from '@/usecase/poll/create/create.poll.usecase'
import ListPollUseCase from '@/usecase/poll/list/list.poll.usecase'
import ActivatePollUseCase from '@/usecase/poll/activate/activate.poll.usecase'
import DeletePollUseCase from '@/usecase/poll/delete/delete.poll.usecase'
import { toPollOutput } from '@/usecase/poll/poll.dto'
import { ActionResult, runAction } from '@/infrastructure/action-result'
import { InputListPollPageDto } from '@/usecase/poll/poll.dto'

const voteSchema = z.object({
  id: z.string().min(1).optional(),
  memberId: z.string().min(1),
  activityId: z.string().min(1),
})

const pollSchema = z.object({
  name: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
  photos: z
    .array(
      z.object({
        id: z.string().min(1),
        dataUrl: z.string().startsWith('data:image/'),
        isPrimary: z.boolean(),
      }),
    )
    .max(10)
    .optional(),
})

export async function getPoll() {
  const repository = new PollRepository()
  const usecase = new GetPollUseCase(repository)
  return usecase.execute()
}

export async function getActivePoll() {
  const poll = await new PollRepository().findActive()
  return poll ? toPollOutput(poll) : null
}

export async function addVote(input: {
  id?: string
  memberId: string
  activityId: string
}): Promise<ActionResult<Awaited<ReturnType<AddVotePollUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new PollRepository()
    const memberRepository = new MemberRepository()
    const activityRepository = new ActivityRepository()
    const usecase = new AddVotePollUseCase(repository, memberRepository, activityRepository, new PollVotingService())
    const output = await usecase.execute(voteSchema.parse(input))

    revalidatePath('/')
    revalidatePath('/admin')
    return output
  })
}

export async function updatePoll(input: {
  id?: string
  name?: string
  title?: string
  description?: string
  expiresAt?: Date
  photos?: { id: string; dataUrl: string; isPrimary: boolean }[]
}): Promise<ActionResult<Awaited<ReturnType<UpdatePollUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new PollRepository()
    const usecase = new UpdatePollUseCase(repository)
    const output = await usecase.execute(pollSchema.extend({ id: z.string().min(1).optional() }).parse(input))

    revalidatePath('/')
    revalidatePath('/admin')
    return output
  })
}

export async function clearVotes(
  id?: string,
): Promise<ActionResult<Awaited<ReturnType<ClearVotesPollUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new PollRepository()
    const usecase = new ClearVotesPollUseCase(repository)
    const output = await usecase.execute(id ? z.string().min(1).parse(id) : undefined)

    revalidatePath('/')
    revalidatePath('/admin')
    return output
  })
}

export async function listPolls() {
  return new ListPollUseCase(new PollRepository()).execute()
}

export async function listPollsPage(input: InputListPollPageDto) {
  const parsed = z
    .object({
      page: z.number().int().min(1),
      pageSize: z.number().int().min(1).max(100),
    })
    .parse(input)
  return new ListPollUseCase(new PollRepository()).executePage(parsed)
}

export async function createPoll(input: {
  name: string
  title: string
  description: string
  expiresAt: Date
  photos?: { id: string; dataUrl: string; isPrimary: boolean }[]
}) {
  return runAction(async () => {
    const output = await new CreatePollUseCase(new PollRepository()).execute(pollSchema.required().parse(input))
    revalidatePath('/')
    revalidatePath('/admin/poll')
    return output
  })
}

export async function activatePoll(id: string) {
  return runAction(async () => {
    const output = await new ActivatePollUseCase(new PollRepository()).execute(z.string().min(1).parse(id))
    revalidatePath('/')
    revalidatePath('/admin/poll')
    return output
  })
}

export async function deletePoll(id: string) {
  return runAction(async () => {
    const output = await new DeletePollUseCase(new PollRepository()).execute(z.string().min(1).parse(id))
    revalidatePath('/')
    revalidatePath('/admin/poll')
    return output
  })
}
