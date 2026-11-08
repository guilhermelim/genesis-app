import Activity from '../entity/activity'
import { randomUUID } from 'node:crypto'
import ActivityIconName from '../value-object/activity-icon-name'

export default class ActivityFactory {
  /**
   * Creates a new Activity.
   * @param name Name of the activity
   * @param description Description of the activity
   * @param label Prefix/label of the activity to be displayed in the list
   * @param id Optional ID used when reconstituting an existing activity.
   * @returns Instance of Activity
   */
  static create(
    name: string,
    description: string,
    label: string,
    id: string = randomUUID(),
    iconName: string = ActivityIconName.DEFAULT,
  ): Activity {
    return new Activity(name, description, label, id, iconName)
  }
}
