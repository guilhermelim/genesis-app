import mongoose, { Schema, model, Document } from 'mongoose'

export interface VoteDocument {
  _id: string
  memberId: string
  activityId: string
  votedAt: Date
}

export interface PhotoDocument {
  _id: string
  dataUrl: string
  isPrimary: boolean
}

export interface PollDocument extends Document<string> {
  _id: string
  __v?: number
  name: string
  title: string
  description: string
  votes: VoteDocument[]
  photos: PhotoDocument[]
  expiresAt: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const voteSchema = new Schema<VoteDocument>(
  {
    _id: { type: String, required: true },
    memberId: { type: String, required: true },
    activityId: { type: String, required: true },
    votedAt: { type: Date, required: true },
  },
  { _id: false },
)

const pollSchema = new Schema<PollDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    votes: [voteSchema],
    photos: [
      {
        _id: { type: String, required: true },
        dataUrl: { type: String, required: true },
        isPrimary: { type: Boolean, required: true },
      },
    ],
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
)

pollSchema.index({ active: 1 }, { unique: true, partialFilterExpression: { active: true } })

export const PollModel = mongoose.models.polls || model<PollDocument>('polls', pollSchema)
