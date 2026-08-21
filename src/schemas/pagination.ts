import { z } from "zod";

export const pagedResultSchema = <ItemSchema extends z.ZodTypeAny>(itemSchema: ItemSchema) =>
    z.object({
        items: z.array(itemSchema),
        page: z.number(),
        pageSize: z.number(),
        totalCount: z.number(),
        totalPages: z.number(),
    });
