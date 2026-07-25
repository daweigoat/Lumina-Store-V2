"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
}

const BannerSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().url(),
  linkUrl: z.string().optional(),
  position: z.enum(["HOMEPAGE", "PROMO"]),
  isActive: z.boolean().default(true)
})

export async function createBanner(formData: FormData) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" }

  try {
    const data = {
      title: formData.get("title") as string,
      imageUrl: formData.get("imageUrl") as string,
      linkUrl: formData.get("linkUrl") as string || undefined,
      position: formData.get("position") as "HOMEPAGE" | "PROMO",
      isActive: formData.get("isActive") === "on"
    }

    const parsed = BannerSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: "Invalid banner data" }

    await prisma.banner.create({
      data: parsed.data
    })

    const session = await auth()
    await prisma.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "CREATE_BANNER",
        entity: "Banner",
        entityId: "NEW",
        details: JSON.stringify(parsed.data)
      }
    })

    revalidatePath("/admin/banners")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
