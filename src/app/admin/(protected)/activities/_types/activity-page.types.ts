import type { ActivityListItemSchemaType } from '../_components/activity-list.component.schema'

export interface ActivityPageViewModel {
  items: ActivityListItemSchemaType[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
