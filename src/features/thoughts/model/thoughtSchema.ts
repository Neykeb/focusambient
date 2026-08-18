import { z } from 'zod'

export const thoughtTextSchema = z.string().trim().min(1).max(160)

export const thoughtSchema = z.object({
  id: z.string().min(1),
  text: thoughtTextSchema,
  createdAt: z.iso.datetime(),
  presetId: z.string().min(1),
  presetLabel: z.string().min(1).max(32),
  isDone: z.boolean(),
})

export const storedThoughtsSchema = z.array(thoughtSchema).max(100)

export type Thought = z.infer<typeof thoughtSchema>
export type NewThought = Pick<Thought, 'text' | 'presetId' | 'presetLabel'>
