export interface InputUpdatePollDto {
  id?: string
  name?: string
  title?: string
  description?: string
  expiresAt?: Date
  photos?: { id: string; dataUrl: string; isPrimary: boolean }[]
}

export interface OutputUpdatePollDto {
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
  expiresAt: Date
  active: boolean
  photos: { id: string; dataUrl: string; isPrimary: boolean }[]
}
