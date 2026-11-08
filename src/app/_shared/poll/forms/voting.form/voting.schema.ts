import { z } from 'zod'

export const votingSchema = z.object({
  memberId: z.string().min(1, 'Selecione um membro'),
  activityId: z.string().min(1, 'Selecione uma atividade'),
})

export type VotingFormValues = z.infer<typeof votingSchema>
