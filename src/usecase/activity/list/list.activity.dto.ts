export interface OutputListActivityDto {
  id: string
  name: string
  label: string
  description: string
  iconName: string
}

export interface InputListActivityPageDto {
  page: number
  pageSize: number
}

export interface OutputListActivityPageDto {
  items: OutputListActivityDto[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
