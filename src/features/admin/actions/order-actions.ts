"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@prisma/client"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
}

export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
    
    const session = await auth()
    await prisma.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "ADMIN_UPDATE_ORDER_STATUS",
        entity: "Order",
        entityId: orderId,
        details: JSON.stringify({ status })
      }
    })

    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
