import DomainError from '@/domain/@shared/errors/domain-error'

const activityIconNames = [
  'default',
  'Music2',
  'Utensils',
  'Coffee',
  'Salad',
  'Smile',
  'PartyPopper',
  'Church',
  'HandHeart',
  'HeartHandshake',
  'Gift',
  'BookOpenText',
  'MessagesSquare',
  'House',
  'UsersRound',
] as const

export type ActivityIconNameValue = (typeof activityIconNames)[number]

export default class ActivityIconName {
  static readonly DEFAULT: ActivityIconNameValue = 'default'
  static readonly VALUES = activityIconNames

  readonly value: ActivityIconNameValue

  constructor(value: string = ActivityIconName.DEFAULT) {
    if (!ActivityIconName.isValid(value)) {
      throw new DomainError('Invalid activity icon name.')
    }

    this.value = value
    Object.freeze(this)
  }

  static isValid(value: string): value is ActivityIconNameValue {
    return activityIconNames.includes(value as ActivityIconNameValue)
  }
}
