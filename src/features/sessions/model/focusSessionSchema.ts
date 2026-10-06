import { z } from "zod";

export const focusSessionSchema = z.object({
  id: z.string().min(1),
  presetId: z.string().min(1),
  label: z.string().min(1).max(32),
  durationSeconds: z
    .number()
    .int()
    .min(1)
    .max(240 * 60),
  completedAt: z.iso.datetime(),
});

export const newFocusSessionSchema = focusSessionSchema
  .pick({
    id: true,
    presetId: true,
    label: true,
    durationSeconds: true,
  })
  .partial({ id: true });

export const storedFocusSessionsSchema = z.array(focusSessionSchema).max(100);

export type FocusSession = z.infer<typeof focusSessionSchema>;
export type NewFocusSession = z.infer<typeof newFocusSessionSchema>;
