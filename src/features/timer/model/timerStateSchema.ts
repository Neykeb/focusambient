import { z } from "zod";

const timerPresetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(32),
  compactLabel: z.string().min(1).max(16),
  durationSeconds: z
    .number()
    .int()
    .min(1)
    .max(240 * 60),
});

export const storedTimerStateSchema = z.object({
  sessionId: z.string().min(1).optional(),
  preset: timerPresetSchema,
  durationSeconds: z
    .number()
    .int()
    .min(1)
    .max(240 * 60),
  remainingSeconds: z
    .number()
    .int()
    .min(0)
    .max(240 * 60),
  status: z.enum(["idle", "running", "paused", "completed"]),
  endsAt: z.number().int().positive().nullable(),
});

export type StoredTimerState = z.infer<typeof storedTimerStateSchema>;
