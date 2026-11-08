export interface OutputListMemberDto {
  id: string
  name: string
  image?: string
  active: boolean
}

export interface InputListMemberPageDto {
  page: number
  pageSize: number
}

export interface OutputListMemberPageDto {
  items: OutputListMemberDto[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
