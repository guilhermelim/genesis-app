import { z } from 'zod'
import ActivityIconName from '@/domain/activity/value-object/activity-icon-name'

export const activitySchema = z.object({
  label: z.string().min(1, 'O prefixo da atividade é obrigatório'),
  name: z.string().min(1, 'O nome da atividade é obrigatório'),
  description: z.string().min(1, 'A descrição da atividade é obrigatória'),
  iconName: z.enum(ActivityIconName.VALUES),
})

export type ActivityFormValues = z.infer<typeof activitySchema>
