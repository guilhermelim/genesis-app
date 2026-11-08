export interface InputCreateMemberDto {
  name: string
  image?: string
  active?: boolean
}

export interface OutputCreateMemberDto {
  id: string
  name: string
  image?: string
  active: boolean
}
