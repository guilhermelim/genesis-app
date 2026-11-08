import { createActivity, deleteActivity, updateActivity } from '@/infrastructure/activity/activity.actions'
import { unwrapActionResult } from '@/infrastructure/action-result'
import type { ActivityFormValues } from '../_forms/activity.form/activity.schema'
import type { ActivityListItemSchemaType } from '../_components/activity-list.component.schema'
import type { OutputCreateActivityDto } from '@/usecase/activity/create/create.activity.dto'
import type { OutputUpdateActivityDto } from '@/usecase/activity/update/update.activity.dto'

export function createActivityCommand(input: ActivityFormValues): Promise<OutputCreateActivityDto> {
  return unwrapActionResult(createActivity(input))
}

export function updateActivityCommand(input: ActivityListItemSchemaType): Promise<OutputUpdateActivityDto> {
  return unwrapActionResult(updateActivity(input))
}

export function deleteActivityCommand(id: string): Promise<{ id: string }> {
  return unwrapActionResult(deleteActivity(id))
}
