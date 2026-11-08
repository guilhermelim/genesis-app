export default interface Vote {
  readonly id: string
  readonly memberId: string
  readonly activityId: string
  readonly votedAt: Date
}
