import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import { InputFindActivityDto, OutputFindActivityDto } from './find.activity.dto'

export default class FindActivityUseCase {
  private activityRepository: ActivityRepositoryInterface

  constructor(activityRepository: ActivityRepositoryInterface) {
    this.activityRepository = activityRepository
  }

  async execute(input: InputFindActivityDto): Promise<OutputFindActivityDto> {
    const activity = await this.activityRepository.find(input.id)

    return {
      id: activity.id,
      name: activity.name,
      label: activity.label,
      description: activity.description,
      iconName: activity.iconName,
    }
  }
}
