import { z } from 'zod'

export const memberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome do membro é obrigatório'),
  image: z.string().optional(),
  active: z.boolean(),
})

export type MemberFormValues = z.infer<typeof memberSchema>
