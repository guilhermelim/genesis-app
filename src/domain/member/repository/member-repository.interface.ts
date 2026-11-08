import RepositoryInterface from '../../@shared/repository/repository-interface'
import Member from '../entity/member'

export interface MemberPage {
  items: Member[]
  totalItems: number
}

export default interface MemberRepositoryInterface extends RepositoryInterface<Member> {
  findPage(page: number, pageSize: number): Promise<MemberPage>
}
