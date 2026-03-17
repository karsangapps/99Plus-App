import { z } from 'zod'

const dobRegex = /^\d{4}-\d{2}-\d{2}$/
const phoneRegex = /^\+?[0-9\s-]{10,18}$/

export const signupBodySchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(200).trim(),
    email: z.string().email('Invalid email').transform((s) => s.toLowerCase().trim()),
    phone: z
      .string()
      .max(18)
      .refine((s) => !s || phoneRegex.test(s.replace(/\s/g, '')), 'Invalid phone format')
      .transform((s) => s.trim() || '')
      .optional()
      .default(''),
    dob: z.string().regex(dobRegex, 'DOB must be YYYY-MM-DD'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    preferredLanguage: z.enum(['en', 'hi']).default('en'),
    examYear: z.number().int().min(2024).max(2030).default(2026),
    class12Stream: z.string().min(1, 'Class 12 stream is required').trim(),
    boardName: z.string().min(1, 'Board name is required').trim(),
    targetUniversities: z.array(z.string().trim()).min(1, 'Pick at least one target university'),
    termsAccepted: z.boolean().refine((v) => v === true, 'You must accept Terms and Privacy Policy'),
    guardian: z
      .object({
        method: z.enum(['sms', 'email']).optional(),
        phone: z.string().nullable().optional(),
        email: z.string().nullable().optional()
      })
      .nullable()
      .optional()
  })

export type SignupBody = z.infer<typeof signupBodySchema>
