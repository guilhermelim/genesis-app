import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import { InputUpdateActivityDto, OutputUpdateActivityDto } from './update.activity.dto'
import ActivityFactory from '@/domain/activity/factory/activity.factory'

export default class UpdateActivityUseCase {
  private activityRepository: ActivityRepositoryInterface

  constructor(activityRepository: ActivityRepositoryInterface) {
    this.activityRepository = activityRepository
  }

  async execute(input: InputUpdateActivityDto): Promise<OutputUpdateActivityDto> {
    const activity = ActivityFactory.create(input.name, input.description, input.label, input.id, input.iconName)

    await this.activityRepository.update(activity)

    return {
      id: activity.id,
      name: activity.name,
      label: activity.label,
      description: activity.description,
      iconName: activity.iconName,
    }
  }
}
