import { z } from 'zod'

export const createOrderBodySchema = z.object({
  product_type: z.enum([
    'sachet_mock',
    'sachet_drill_pack',
    'pro_pass_monthly',
    'pro_pass_seasonal',
  ]),
  product_reference: z.string().max(100).optional(),
  amount_paise: z.number().int().positive('Amount must be positive'),
})

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>
