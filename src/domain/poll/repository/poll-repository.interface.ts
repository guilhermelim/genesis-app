import Poll from '../entity/poll'

export interface PollPage {
  items: Poll[]
  totalItems: number
}

export default interface PollRepositoryInterface {
  find(id: string): Promise<Poll>
  findOrCreateDefault(): Promise<Poll>
  findActive(): Promise<Poll | null>
  findAll(): Promise<Poll[]>
  findPage(page: number, pageSize: number): Promise<PollPage>

  /**
   * Saves/updates the poll
   */
  save(poll: Poll): Promise<void>
  create(poll: Poll): Promise<void>
  delete(id: string): Promise<void>
}
