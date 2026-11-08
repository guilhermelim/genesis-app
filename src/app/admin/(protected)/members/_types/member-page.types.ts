import type { MemberListItemSchemaType } from '../_components/member-list.component.schema'

export interface MemberPageViewModel {
  items: MemberListItemSchemaType[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
