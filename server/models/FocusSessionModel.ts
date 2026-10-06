import { model, Schema } from 'mongoose'

const focusSessionSchema = new Schema({
  ownerId: { type: String, required: true, index: true },
  id: { type: String, required: true },
  presetId: { type: String, required: true },
  label: { type: String, required: true, maxlength: 32 },
  durationSeconds: { type: Number, required: true, min: 1, max: 240 * 60 },
  completedAt: { type: String, required: true, index: true },
}, {
  versionKey: false,
})

focusSessionSchema.index({ ownerId: 1, id: 1 }, { unique: true })

export const FocusSessionModel = model('FocusSession', focusSessionSchema)
