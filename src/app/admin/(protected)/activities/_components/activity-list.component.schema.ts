import { z } from 'zod'

export const activityListItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Prefixo obrigatório'),
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().min(1, 'Descrição obrigatória'),
  iconName: z.string().min(1, 'Ícone obrigatório'),
})

export type ActivityListItemSchemaType = z.infer<typeof activityListItemSchema>
