export interface InputAddVotePollDto {
  id?: string
  memberId: string
  activityId: string
}

export interface OutputAddVotePollDto {
  id: string
  name: string
  title: string
  description: string
  votes: Array<{
    id: string
    memberId: string
    activityId: string
    votedAt: Date
  }>
  createdAt: Date
  updatedAt: Date
  version: number
  expiresAt: Date
  active: boolean
  photos: Array<{ id: string; dataUrl: string; isPrimary: boolean }>
}
