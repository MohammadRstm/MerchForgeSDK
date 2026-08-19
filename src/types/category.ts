/**
 * MerchForge has no Category entity — Product.Category is a plain string column.
 * A category is therefore just the distinct string value it always has been; there
 * is no id, description, image, or product count to expose because none of that
 * data exists on the backend yet.
 */
export type Category = string;
