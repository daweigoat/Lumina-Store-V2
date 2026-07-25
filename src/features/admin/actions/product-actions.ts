"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { ProductStatus } from "@prisma/client"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
}

export async function updateProductStatus(productId: string, status: ProductStatus) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status }
    })
    
    const session = await auth()
    await prisma.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "UPDATE_PRODUCT_STATUS",
        entity: "Product",
        entityId: productId,
        details: JSON.stringify({ status })
      }
    })

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
