"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      throw new Error("Unauthorized")
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) throw new Error("Store not found")

    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId: store.id }
    })

    if (!order) throw new Error("Order not found or access denied")

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath("/seller/orders")
    return { success: true }
  } catch (error) {
    console.error("Order status update error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
