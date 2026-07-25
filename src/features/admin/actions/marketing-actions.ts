"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
}

const GlobalCouponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.number().min(0.01),
  minSpend: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  usageLimit: z.number().optional(),
})

export async function createGlobalCoupon(formData: FormData) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" }

  try {
    const data = {
      code: (formData.get("code") as string).toUpperCase(),
      discountType: formData.get("discountType") as "PERCENTAGE" | "FLAT",
      discountValue: parseFloat(formData.get("discountValue") as string),
      minSpend: formData.get("minSpend") ? parseFloat(formData.get("minSpend") as string) : undefined,
      validFrom: formData.get("validFrom") as string,
      validUntil: formData.get("validUntil") as string,
      usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string, 10) : undefined,
    }

    const parsed = GlobalCouponSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: "Invalid coupon data" }

    await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        minSpend: parsed.data.minSpend,
        validFrom: new Date(parsed.data.validFrom),
        validUntil: new Date(parsed.data.validUntil),
        usageLimit: parsed.data.usageLimit
        // storeId is intentionally omitted to make it global
      }
    })

    const session = await auth()
    await prisma.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "CREATE_GLOBAL_COUPON",
        entity: "Coupon",
        entityId: "NEW",
        details: JSON.stringify({ code: parsed.data.code })
      }
    })

    revalidatePath("/admin/marketing")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
