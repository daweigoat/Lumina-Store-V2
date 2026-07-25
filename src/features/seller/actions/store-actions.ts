"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const StoreSettingsSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  defaultShippingFee: z.number().min(0).optional(),
  shippingOrigin: z.string().optional(),
})

export async function updateStoreSettings(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      throw new Error("Unauthorized")
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      defaultShippingFee: formData.get("defaultShippingFee") ? parseFloat(formData.get("defaultShippingFee") as string) : undefined,
      shippingOrigin: formData.get("shippingOrigin") as string || undefined,
    }

    const parsed = StoreSettingsSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid store data" }
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) {
      return { success: false, error: "Store not found" }
    }

    await prisma.store.update({
      where: { id: store.id },
      data: parsed.data
    })

    revalidatePath("/seller/settings")
    return { success: true }
  } catch (error) {
    console.error("Store update error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
