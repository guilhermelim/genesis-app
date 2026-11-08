import { z } from 'zod'
import type { PollViewModel } from '@/app/_shared/poll/types/poll-view-model.types'

export const pollPhotoSchema = z.object({
  id: z.string(),
  dataUrl: z.string(),
  isPrimary: z.boolean(),
})

export const pollSchema = z.object({
  name: z.string().min(1, 'O nome da enquete é obrigatório'),
  title: z.string().min(1, 'O título da enquete é obrigatório'),
  description: z.string().min(1, 'A descrição da enquete é obrigatória'),
  expiresAt: z.date().optional(),
  photos: z
    .array(pollPhotoSchema)
    .max(10, 'Você pode adicionar no máximo 10 fotos. Remova algumas fotos para continuar.'),
})

export type PollFormValues = z.infer<typeof pollSchema>

export type PollData = PollViewModel
