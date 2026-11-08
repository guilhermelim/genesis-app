import type { PollData } from './poll.schema'
import type { PollFormValues } from './poll.schema'

export const pollDefaultValues = (poll?: PollData, defaultExpiresAt?: Date): PollFormValues => ({
  name: poll?.name ?? '',
  title: poll?.title ?? '',
  description: poll?.description ?? '',
  expiresAt: poll?.expiresAt ?? defaultExpiresAt,
  photos: poll?.photos ?? [],
})
