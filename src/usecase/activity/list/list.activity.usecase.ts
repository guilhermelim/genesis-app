import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import { InputListActivityPageDto, OutputListActivityDto, OutputListActivityPageDto } from './list.activity.dto'

export default class ListActivityUseCase {
  private activityRepository: ActivityRepositoryInterface

  constructor(activityRepository: ActivityRepositoryInterface) {
    this.activityRepository = activityRepository
  }

  async execute(): Promise<OutputListActivityDto[]> {
    const activities = await this.activityRepository.findAll()
    return activities.map(activity => ({
      id: activity.id,
      name: activity.name,
      label: activity.label,
      description: activity.description,
      iconName: activity.iconName,
    }))
  }

  async executePage(input: InputListActivityPageDto): Promise<OutputListActivityPageDto> {
    const page = Math.max(1, Math.floor(input.page))
    const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize)))
    const result = await this.activityRepository.findPage(page, pageSize)
    const totalPages = Math.max(1, Math.ceil(result.totalItems / pageSize))
    const normalizedPage = Math.min(page, totalPages)
    const normalizedResult =
      normalizedPage === page ? result : await this.activityRepository.findPage(normalizedPage, pageSize)

    return {
      items: normalizedResult.items.map(activity => ({
        id: activity.id,
        name: activity.name,
        label: activity.label,
        description: activity.description,
        iconName: activity.iconName,
      })),
      page: normalizedPage,
      pageSize,
      totalItems: normalizedResult.totalItems,
      totalPages,
    }
  }
}
