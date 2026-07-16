import { z } from 'zod'

export const customTimerInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(32, 'Use no more than 32 characters.'),
  durationMinutes: z.coerce
    .number()
    .int('Use whole minutes.')
    .min(1, 'Choose at least 1 minute.')
    .max(240, 'Choose no more than 240 minutes.'),
})

export const storedCustomTimerSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(32),
  compactLabel: z.string().min(1).max(32),
  durationSeconds: z.number().int().min(60).max(240 * 60),
})

export const storedCustomTimersSchema = z.array(storedCustomTimerSchema)

export type CustomTimerInput = z.infer<typeof customTimerInputSchema>
