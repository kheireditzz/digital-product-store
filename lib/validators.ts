import { z } from "zod"

export const checkoutSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID").optional().nullable(),
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerEmail: z.string().email("Format email tidak valid"),
  customerPhone: z.string().min(9, "Nomor WhatsApp minimal 9 digit").optional(),
  couponCode: z.string().optional().nullable(),
  affiliateRef: z.string().optional().nullable(),
})

export const couponValidateSchema = z.object({
  code: z.string().min(1, "Kode kupon wajib diisi"),
  subtotal: z.number().min(0),
})

export const reviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Komentar minimal 3 karakter").max(500),
})

export const newsletterSchema = z.object({
  email: z.string().email("Format email tidak valid"),
})

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter"),
  description: z.string().optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  discountPrice: z.number().min(0).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})
