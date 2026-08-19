import { z } from "zod";

export const categorySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    displayOrder: z.number(),
    productCount: z.number(),
});

export const categoriesSchema = z.array(categorySchema);
