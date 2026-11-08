import RepositoryInterface from '../../@shared/repository/repository-interface'
import Activity from '../entity/activity'

export interface ActivityPage {
  items: Activity[]
  totalItems: number
}

export default interface ActivityRepositoryInterface extends RepositoryInterface<Activity> {
  findPage(page: number, pageSize: number): Promise<ActivityPage>
}
