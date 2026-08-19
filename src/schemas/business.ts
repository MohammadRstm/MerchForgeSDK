import { z } from "zod";

export const businessSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
});
