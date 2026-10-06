import { model, Schema } from "mongoose";

const thoughtSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 160 },
    presetId: { type: String, required: true },
    presetLabel: { type: String, required: true, maxlength: 32 },
    isDone: { type: Boolean, required: true, default: false },
    createdAt: { type: String, required: true, index: true },
  },
  {
    versionKey: false,
  },
);

thoughtSchema.index({ ownerId: 1, id: 1 }, { unique: true });

export const ThoughtModel = model("Thought", thoughtSchema);
