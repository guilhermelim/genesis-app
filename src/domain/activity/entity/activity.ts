import ActivityInterface from './activity.interface'
import DomainError from '@/domain/@shared/errors/domain-error'
import ActivityIconName from '../value-object/activity-icon-name'
export default class Activity implements ActivityInterface {
  private _id: string
  private _name: string
  private _description: string
  private _label: string
  private _iconName: string

  constructor(
    name: string,
    description: string,
    label: string,
    id: string,
    iconName: string = ActivityIconName.DEFAULT,
  ) {
    this._id = id
    this._name = name
    this._description = description
    this._label = label
    this._iconName = new ActivityIconName(iconName).value

    this.validate()
    Object.freeze(this)
  }

  private validate(): boolean {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainError('Name is required.')
    }

    if (!this._label || this._label.trim().length === 0) {
      throw new DomainError('Label is required.')
    }

    if (!this._id || this._id.trim().length === 0) {
      throw new DomainError('Invalid ID.')
    }

    return true
  }

  changeName(name: string): Activity {
    return this.copy({ name })
  }

  changeDescription(description: string): Activity {
    return this.copy({ description })
  }

  changeLabel(label: string): Activity {
    return this.copy({ label })
  }

  changeIconName(iconName: string): Activity {
    return this.copy({ iconName })
  }

  private copy(changes: { name?: string; description?: string; label?: string; iconName?: string }): Activity {
    return new Activity(
      changes.name ?? this._name,
      changes.description ?? this._description,
      changes.label ?? this._label,
      this._id,
      changes.iconName ?? this._iconName,
    )
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get description(): string {
    return this._description
  }

  get label(): string {
    return this._label
  }

  get iconName(): string {
    return this._iconName
  }
}
