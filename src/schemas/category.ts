import { z } from "zod";

export const categorySchema = z.string();

export const categoriesSchema = z.array(categorySchema);
