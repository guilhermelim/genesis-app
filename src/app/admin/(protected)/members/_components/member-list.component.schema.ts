import { z } from 'zod'

export const memberListItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do membro obrigatório'),
  image: z.string().optional(),
  active: z.boolean(),
})

export type MemberListItemSchemaType = z.infer<typeof memberListItemSchema>
