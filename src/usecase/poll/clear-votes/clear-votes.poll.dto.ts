export interface OutputClearVotesPollDto {
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
}
