import mongoose, { Schema, model, Document } from 'mongoose'

export interface PollSettingsDocument extends Document<string> {
  _id: string
  weekday: number
  hour: number
  minute: number
}

const schema = new Schema<PollSettingsDocument>({
  _id: { type: String, required: true },
  weekday: { type: Number, required: true, default: 3 },
  hour: { type: Number, required: true, default: 0 },
  minute: { type: Number, required: true, default: 0 },
})

export const PollSettingsModel = mongoose.models.pollSettings || model<PollSettingsDocument>('pollSettings', schema)
