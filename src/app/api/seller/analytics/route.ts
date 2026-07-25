import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Analytics: Total Sales, Total Orders, Pending Orders
    const [totalSalesResult, orderCounts] = await Promise.all([
      prisma.order.aggregate({
        where: { storeId: store.id, status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED"] } },
        _sum: { totalAmount: true }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { storeId: store.id },
        _count: true
      })
    ])

    const totalSales = totalSalesResult._sum.totalAmount || 0
    let totalOrders = 0
    let pendingOrders = 0

    orderCounts.forEach(c => {
      totalOrders += c._count
      if (c.status === "PENDING_PAYMENT" || c.status === "PAID") {
        pendingOrders += c._count
      }
    })

    return NextResponse.json({
      totalSales,
      totalOrders,
      pendingOrders,
      statusCounts: orderCounts
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
