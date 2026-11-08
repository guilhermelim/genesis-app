import mongoose, { Schema, model, Document } from 'mongoose'

export interface MemberDocument extends Document<string> {
  _id: string
  name: string
  image?: string
  active: boolean
}

const memberSchema = new Schema<MemberDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: false },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

export const MemberModel = mongoose.models.members || model<MemberDocument>('members', memberSchema)
