import { z } from "zod";

export const orderStatusSchema = z.enum(["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]);

export const paymentStatusSchema = z.enum(["Pending", "Paid", "Refunded"]);

export const orderItemSchema = z.object({
    productId: z.string().uuid(),
    productTitle: z.string(),
    productImageUrl: z.string().nullable(),
    unitPrice: z.number(),
    quantity: z.number(),
    lineTotal: z.number(),
});

export const orderSchema = z.object({
    id: z.string().uuid(),
    status: orderStatusSchema,
    paymentStatus: paymentStatusSchema,
    customerName: z.string(),
    customerEmail: z.string(),
    customerPhone: z.string().nullable(),
    shippingAddressLine1: z.string(),
    shippingAddressLine2: z.string().nullable(),
    shippingCity: z.string(),
    shippingState: z.string().nullable(),
    shippingPostalCode: z.string(),
    shippingCountry: z.string(),
    customerNotes: z.string().nullable(),
    subtotal: z.number(),
    total: z.number(),
    currency: z.string(),
    items: z.array(orderItemSchema),
    createdAt: z.iso.datetime(),
});
