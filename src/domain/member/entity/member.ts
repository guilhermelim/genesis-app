import MemberInterface from './member.interface'
import DomainError from '@/domain/@shared/errors/domain-error'
export default class Member implements MemberInterface {
  private _id: string
  private _name: string
  private _image?: string
  private _active: boolean

  constructor(name: string, id: string, image?: string, active = true) {
    this._id = id
    this._name = name
    this._image = image
    this._active = active

    this.validate()
    Object.freeze(this)
  }

  private validate(): boolean {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainError('Name is required.')
    }

    if (!this._id || this._id.trim().length === 0) {
      throw new DomainError('Invalid ID.')
    }

    return true
  }

  changeName(name: string): Member {
    return this.copy({ name })
  }

  changeImage(image?: string): Member {
    return this.copy({ image })
  }

  activate(): Member {
    return this.copy({ active: true })
  }

  deactivate(): Member {
    return this.copy({ active: false })
  }

  private copy(changes: { name?: string; image?: string; active?: boolean }): Member {
    return new Member(
      changes.name ?? this._name,
      this._id,
      Object.prototype.hasOwnProperty.call(changes, 'image') ? changes.image : this._image,
      changes.active ?? this._active,
    )
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get image(): string | undefined {
    return this._image
  }

  get active(): boolean {
    return this._active
  }
}
