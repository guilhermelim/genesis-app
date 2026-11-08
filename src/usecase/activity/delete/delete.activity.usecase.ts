import ActivityRepositoryInterface from '@/domain/activity/repository/activity-repository.interface'
import { InputDeleteActivityDto, OutputDeleteActivityDto } from './delete.activity.dto'

export default class DeleteActivityUseCase {
  private activityRepository: ActivityRepositoryInterface

  constructor(activityRepository: ActivityRepositoryInterface) {
    this.activityRepository = activityRepository
  }

  async execute(input: InputDeleteActivityDto): Promise<OutputDeleteActivityDto> {
    await this.activityRepository.delete(input.id)

    return {
      id: input.id,
    }
  }
}
