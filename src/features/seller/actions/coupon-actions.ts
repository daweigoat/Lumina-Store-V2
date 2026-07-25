"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { DiscountType } from "@prisma/client"

const CouponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.number().min(0.01),
  minSpend: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  usageLimit: z.number().optional(),
})

export async function upsertCoupon(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      throw new Error("Unauthorized")
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) throw new Error("Store not found")

    const data = {
      id: formData.get("id") as string || undefined,
      code: (formData.get("code") as string).toUpperCase(),
      discountType: formData.get("discountType") as DiscountType,
      discountValue: parseFloat(formData.get("discountValue") as string),
      minSpend: formData.get("minSpend") ? parseFloat(formData.get("minSpend") as string) : undefined,
      validFrom: formData.get("validFrom") as string,
      validUntil: formData.get("validUntil") as string,
      usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string, 10) : undefined,
    }

    const parsed = CouponSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: "Invalid coupon data" }

    if (parsed.data.id) {
      await prisma.coupon.update({
        where: { id: parsed.data.id, storeId: store.id },
        data: {
          code: parsed.data.code,
          discountType: parsed.data.discountType,
          discountValue: parsed.data.discountValue,
          minSpend: parsed.data.minSpend,
          validFrom: new Date(parsed.data.validFrom),
          validUntil: new Date(parsed.data.validUntil),
          usageLimit: parsed.data.usageLimit
        }
      })
    } else {
      await prisma.coupon.create({
        data: {
          code: parsed.data.code,
          discountType: parsed.data.discountType,
          discountValue: parsed.data.discountValue,
          minSpend: parsed.data.minSpend,
          validFrom: new Date(parsed.data.validFrom),
          validUntil: new Date(parsed.data.validUntil),
          usageLimit: parsed.data.usageLimit,
          storeId: store.id
        }
      })
    }

    revalidatePath("/seller/coupons")
    return { success: true }
  } catch (error) {
    console.error("Coupon upsert error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
