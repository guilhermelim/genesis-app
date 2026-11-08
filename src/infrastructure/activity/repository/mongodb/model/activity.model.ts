import mongoose, { Schema, model, Document } from 'mongoose'

export interface ActivityDocument extends Document<string> {
  _id: string
  label: string
  name: string
  description: string
  iconName: string
}

const activitySchema = new Schema<ActivityDocument>(
  {
    _id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    iconName: { type: String, required: true, default: 'default', trim: true },
  },
  { timestamps: true },
)

const existingActivityModel = mongoose.models.activities as mongoose.Model<ActivityDocument> | undefined

if (existingActivityModel && !existingActivityModel.schema.path('iconName')) {
  existingActivityModel.schema.add({
    iconName: { type: String, required: true, default: 'default', trim: true },
  })
}

export const ActivityModel = existingActivityModel ?? model<ActivityDocument>('activities', activitySchema)
