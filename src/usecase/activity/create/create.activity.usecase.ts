import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import ActivityFactory from '@/domain/activity/factory/activity.factory'
import { InputCreateActivityDto, OutputCreateActivityDto } from './create.activity.dto'

export default class CreateActivityUseCase {
  private activityRepository: ActivityRepositoryInterface

  constructor(activityRepository: ActivityRepositoryInterface) {
    this.activityRepository = activityRepository
  }

  async execute(input: InputCreateActivityDto): Promise<OutputCreateActivityDto> {
    const activity = ActivityFactory.create(input.name, input.description, input.label, undefined, input.iconName)

    await this.activityRepository.create(activity)

    return {
      id: activity.id,
      name: activity.name,
      label: activity.label,
      description: activity.description,
      iconName: activity.iconName,
    }
  }
}
