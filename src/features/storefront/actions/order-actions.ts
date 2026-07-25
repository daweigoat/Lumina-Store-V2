"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function commitOrderPayment(orderId: string, _transactionId: string) {
  try {
    console.log("Committing transaction:", _transactionId);
    // 1. Get the order and verify it's pending
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        reservations: true,
        items: true
      }
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "PENDING_PAYMENT") {
      throw new Error(`Order cannot be paid. Current status: ${order.status}`)
    }

    // 2. Perform Prisma Transaction for payment success
    await prisma.$transaction(async (tx) => {
      // Update Order Status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" }
      })

      // Commit reservations and decrease inventory
      for (const reservation of order.reservations) {
        if (reservation.status === "ACTIVE") {
          // Decrement inventory
          await tx.variant.update({
            where: { id: reservation.productVariantId },
            data: {
              inventory: { decrement: reservation.quantity }
            }
          })

          // Mark reservation as committed
          await tx.stockReservation.update({
            where: { id: reservation.id },
            data: { status: "COMMITTED" }
          })
        }
      }
    })

    revalidatePath("/checkout")
    revalidatePath("/api/seller/orders")
    
    return { success: true }
  } catch (error) {
    console.error("Payment commit error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function releaseOrderPayment(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { reservations: true }
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Order must be PENDING_PAYMENT to just release. If it's PAID, it requires a refund which increments stock.
    if (order.status !== "PENDING_PAYMENT") {
      throw new Error("Cannot release reservations for a non-pending order")
    }

    await prisma.$transaction(async (tx) => {
      // Update order to cancelled
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      })

      // Release reservations (no inventory decrement happened yet)
      for (const reservation of order.reservations) {
        if (reservation.status === "ACTIVE") {
          await tx.stockReservation.update({
            where: { id: reservation.id },
            data: { status: "RELEASED" }
          })
        }
      }
    })

    revalidatePath("/checkout")
    return { success: true }
  } catch (error) {
    console.error("Payment release error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
