import { z } from "zod";

export const productSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    imageUrl: z.string().nullable(),
    createdAt: z.iso.datetime(),
});
