import { PollOutput } from '../poll.dto'
export interface InputCreatePollDto {
  name: string
  title: string
  description: string
  expiresAt: Date
  photos?: { id: string; dataUrl: string; isPrimary: boolean }[]
}
export type OutputCreatePollDto = PollOutput
