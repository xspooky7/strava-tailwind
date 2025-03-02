import * as z from "zod"

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(30),
  sort: z.string().optional(),
  name: z.string().optional(),
  labels: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
})

export const tableQuerySchema = searchParamsSchema

export type TableQuerySchema = z.infer<typeof tableQuerySchema>
