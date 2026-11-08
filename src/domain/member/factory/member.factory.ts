import Member from '../entity/member'
import { randomUUID } from 'node:crypto'

export default class MemberFactory {
  /**
   * Creates a new member.
   * @param name Member's name.
   * @param id Optional ID used when reconstituting an existing member.
   * @returns Instance of Member.
   */
  static create(name: string, id: string = randomUUID(), image?: string, active = true): Member {
    return new Member(name, id, image, active)
  }
}
