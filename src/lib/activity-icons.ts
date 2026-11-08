import {
  BookOpenText,
  Church,
  Coffee,
  Gift,
  HandHeart,
  HeartHandshake,
  House,
  MessagesSquare,
  Music2,
  PartyPopper,
  Salad,
  Smile,
  Sparkles,
  UsersRound,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityIconNameValue } from '@/domain/activity/value-object/activity-icon-name'

export const activityIconOptions: ReadonlyArray<{
  name: ActivityIconNameValue
  label: string
  icon: LucideIcon
}> = [
  { name: 'default', label: 'Padrão', icon: Sparkles },
  { name: 'Music2', label: 'Adoração e música', icon: Music2 },
  { name: 'Utensils', label: 'Comunhão e refeição', icon: Utensils },
  { name: 'Coffee', label: 'Lanche e acolhimento', icon: Coffee },
  { name: 'Salad', label: 'Alimentação', icon: Salad },
  { name: 'Smile', label: 'Momento relax', icon: Smile },
  { name: 'PartyPopper', label: 'Celebração', icon: PartyPopper },
  { name: 'Church', label: 'Igreja e oração', icon: Church },
  { name: 'HandHeart', label: 'Oração e cuidado', icon: HandHeart },
  { name: 'HeartHandshake', label: 'Comunhão e unidade', icon: HeartHandshake },
  { name: 'Gift', label: 'Oferta e generosidade', icon: Gift },
  { name: 'BookOpenText', label: 'Palavra e ensino', icon: BookOpenText },
  { name: 'MessagesSquare', label: 'Conversa e reflexão', icon: MessagesSquare },
  { name: 'House', label: 'Casinha e lar', icon: House },
  { name: 'UsersRound', label: 'Grupo e comunidade', icon: UsersRound },
] as const

export type ActivityIconName = ActivityIconNameValue

export function getActivityIcon(iconName?: string): LucideIcon {
  return activityIconOptions.find(option => option.name === iconName)?.icon ?? Sparkles
}
