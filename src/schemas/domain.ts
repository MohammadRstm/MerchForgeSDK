import { z } from "zod";

export const domainSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
});
