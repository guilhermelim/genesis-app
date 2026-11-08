import Poll from '../entity/poll'
import Vote from '../entity/vote.interface'
import { randomUUID } from 'node:crypto'
import PollPhoto from '../entity/poll-photo.interface'

export default class PollFactory {
  /**
   * Creates a default poll with initial values
   */
  static createDefault(): Poll {
    return new Poll(
      'Voluntariado Principal',
      'Inscrição para Atividades',
      'Escolha como você deseja servir nas atividades desta semana',
      randomUUID(),
    )
  }

  /**
   * Creates a poll with custom values
   */
  static create(
    name: string,
    title: string,
    description: string,
    votes?: Vote[],
    id: string = randomUUID(),
    createdAt?: Date,
    updatedAt?: Date,
    version?: number,
    photos?: PollPhoto[],
    expiresAt?: Date,
    active?: boolean,
  ): Poll {
    return new Poll(name, title, description, id, votes, createdAt, updatedAt, version, photos, expiresAt, active)
  }

  /**
   * Creates a vote
   */
  static createVote(memberId: string, activityId: string, id?: string): Vote {
    return {
      id: id || randomUUID(),
      memberId,
      activityId,
      votedAt: new Date(),
    }
  }
}
