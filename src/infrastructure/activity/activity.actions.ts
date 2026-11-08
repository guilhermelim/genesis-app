'use server'

import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { z } from 'zod'
import ActivityRepository from './repository/mongodb/activity.repository'
import CreateActivityUseCase from '@/usecase/activity/create/create.activity.usecase'
import DeleteActivityUseCase from '@/usecase/activity/delete/delete.activity.usecase'
import FindActivityUseCase from '@/usecase/activity/find/find.activity.usecase'
import ListActivityUseCase from '@/usecase/activity/list/list.activity.usecase'
import UpdateActivityUseCase from '@/usecase/activity/update/update.activity.usecase'
import { ActionResult, runAction } from '@/infrastructure/action-result'
import ActivityIconName from '@/domain/activity/value-object/activity-icon-name'
import { InputListActivityPageDto } from '@/usecase/activity/list/list.activity.dto'

const activitySchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string(),
  iconName: z.enum(ActivityIconName.VALUES).default(ActivityIconName.DEFAULT),
})

export async function listActivities() {
  noStore()
  const repository = new ActivityRepository()
  const usecase = new ListActivityUseCase(repository)
  return usecase.execute()
}

export async function listActivitiesPage(input: InputListActivityPageDto) {
  noStore()
  const parsed = z
    .object({
      page: z.number().int().min(1),
      pageSize: z.number().int().min(1).max(100),
    })
    .parse(input)
  const repository = new ActivityRepository()
  const usecase = new ListActivityUseCase(repository)
  return usecase.executePage(parsed)
}

export async function findActivity(id: string) {
  noStore()
  const repository = new ActivityRepository()
  const usecase = new FindActivityUseCase(repository)
  return usecase.execute({ id: z.string().min(1).parse(id) })
}

export async function createActivity(input: {
  name: string
  label: string
  description: string
  iconName?: string
}): Promise<ActionResult<Awaited<ReturnType<CreateActivityUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new ActivityRepository()
    const usecase = new CreateActivityUseCase(repository)
    const output = await usecase.execute(activitySchema.omit({ id: true }).parse(input))

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/activities', 'page')
    return output
  })
}

export async function updateActivity(input: {
  id: string
  name: string
  label: string
  description: string
  iconName?: string
}): Promise<ActionResult<Awaited<ReturnType<UpdateActivityUseCase['execute']>>>> {
  return runAction(async () => {
    const repository = new ActivityRepository()
    const usecase = new UpdateActivityUseCase(repository)
    const output = await usecase.execute(activitySchema.required().parse(input))

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/activities', 'page')
    return output
  })
}

export async function deleteActivity(id: string): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const repository = new ActivityRepository()
    const usecase = new DeleteActivityUseCase(repository)
    await usecase.execute({ id: z.string().min(1).parse(id) })

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/activities', 'page')
    return { id }
  })
}
